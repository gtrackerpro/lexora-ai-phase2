import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import awsService from './awsService';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface TTSOptions {
  text: string;
  voice?: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

interface TTSResult {
  audioBuffer: Buffer;
  duration: number;
  format: string;
  audioUrl?: string;
}

interface VoiceCloneOptions {
  name: string;
  description?: string;
  audioFile: Buffer;
  labels?: Record<string, string>;
}

class TTSService {
  private tempDir: string;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.ensureTempDir();

    if (!this.apiKey) {
      console.warn('ELEVENLABS_API_KEY not found in environment variables');
    }
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate speech from text using ElevenLabs TTS
   */
  async generateSpeech(options: TTSOptions): Promise<TTSResult> {
    try {
      const {
        text,
        voiceId = 'pNInz6obpgDQGcFmaJgB', // Default Adam voice
        stability = 0.5,
        similarityBoost = 0.8,
        style = 0.0,
        useSpeakerBoost = true
      } = options;

      console.log(`Generating speech with ElevenLabs for voice: ${voiceId}`);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);
      
      // Estimate duration based on text length (rough calculation: ~150 words per minute)
      const wordCount = text.split(' ').length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      console.log(`ElevenLabs TTS completed. Audio size: ${audioBuffer.length} bytes, Duration: ${estimatedDuration}s`);

      return {
        audioBuffer,
        duration: estimatedDuration,
        format: 'mp3'
      };
    } catch (error: any) {
      console.error('ElevenLabs TTS Error:', error.response?.data || error.message);
      throw new Error(`Failed to generate speech: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  /**
   * Clone a voice from an audio sample
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<string> {
    try {
      const { name, description, audioFile, labels } = options;

      console.log(`Cloning voice with name: ${name}`);

      const formData = new FormData();
      formData.append('name', name);
      if (description) formData.append('description', description);
      if (labels) formData.append('labels', JSON.stringify(labels));

      // Create a temporary file for the audio
      const tempFileName = `voice_clone_${Date.now()}.mp3`;
      const tempFilePath = path.join(this.tempDir, tempFileName);
      await writeFile(tempFilePath, audioFile);

      // Add the file to form data
      const fileStream = fs.createReadStream(tempFilePath);
      formData.append('files', fileStream);

      const response = await axios.post(
        `${this.baseUrl}/voices/add`,
        formData,
        {
          headers: {
            'xi-api-key': this.apiKey,
            ...formData.getHeaders()
          }
        }
      );

      // Clean up temp file
      await unlink(tempFilePath).catch(() => {});

      const voiceId = response.data.voice_id;
      console.log(`Voice cloned successfully with ID: ${voiceId}`);

      return voiceId;
    } catch (error: any) {
      console.error('Voice cloning error:', error.response?.data || error.message);
      throw new Error(`Failed to clone voice: ${error.response?.data?.detail?.message || error.message}`);
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices(): Promise<Array<{ id: string; name: string; category: string; description?: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'generated',
        description: voice.description || `${voice.name} voice`,
        preview_url: voice.preview_url,
        labels: voice.labels
      }));
    } catch (error: any) {
      console.error('Failed to get ElevenLabs voices:', error.response?.data || error.message);
      
      // Return default voices if API call fails
      return [
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', category: 'premade', description: 'Deep, authoritative male voice' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'premade', description: 'Warm, friendly female voice' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade', description: 'Smooth, professional male voice' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'premade', description: 'Young, energetic female voice' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade', description: 'Casual, conversational male voice' }
      ];
    }
  }

  /**
   * Generate speech and upload to S3
   */
  async generateAndUploadSpeech(
    text: string,
    fileName: string,
    options: Partial<TTSOptions> = {}
  ): Promise<{ audioUrl: string; duration: number }> {
    try {
      const ttsResult = await this.generateSpeech({ text, ...options });
      
      const audioUrl = await awsService.uploadFile(
        ttsResult.audioBuffer,
        `${fileName}.mp3`,
        'audio/mp3',
        'generated/audio'
      );

      return {
        audioUrl,
        duration: ttsResult.duration
      };
    } catch (error) {
      console.error('TTS Upload Error:', error);
      throw new Error('Failed to generate and upload speech');
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      console.log(`Voice ${voiceId} deleted successfully`);
      return true;
    } catch (error: any) {
      console.error('Failed to delete voice:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Get voice details
   */
  async getVoiceDetails(voiceId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to get voice details:', error.response?.data || error.message);
      throw new Error(`Failed to get voice details: ${error.message}`);
    }
  }

  /**
   * Test TTS functionality
   */
  async testTTS(): Promise<boolean> {
    try {
      const testText = "Hello, this is a test of the ElevenLabs text-to-speech system.";
      const result = await this.generateSpeech({ text: testText });
      
      console.log('ElevenLabs TTS Test successful:', {
        audioSize: result.audioBuffer.length,
        duration: result.duration,
        format: result.format
      });
      
      return true;
    } catch (error) {
      console.error('ElevenLabs TTS Test failed:', error);
      return false;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const audioFiles = files.filter(file => 
        file.endsWith('.mp3') || 
        file.endsWith('.wav') || 
        file.startsWith('voice_clone_')
      );
      
      const deletePromises = audioFiles.map(file => {
        const filePath = path.join(this.tempDir, file);
        return unlink(filePath).catch(() => {}); // Ignore errors
      });
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${audioFiles.length} temporary audio files`);
    } catch (error) {
      console.error('TTS Cleanup Error:', error);
    }
  }
}

export default new TTSService();