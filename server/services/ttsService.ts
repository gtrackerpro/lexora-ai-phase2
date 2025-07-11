import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import FormData from 'form-data';
import awsService from './awsService';
import { hasApiKey, isDevelopment } from '../utils/devConfig';

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

      // Check if API key is available
      if (!hasApiKey('ELEVENLABS_API_KEY')) {
        if (isDevelopment) {
          console.warn('[DEV MODE] ElevenLabs API key not configured, generating mock audio');
          return this.generateMockAudio(text);
        }
        throw new Error('ElevenLabs API key not configured');
      }

      // Resolve voice ID - if it's a MongoDB ObjectId, map it to a real ElevenLabs voice ID
      const resolvedVoiceId = await this.resolveVoiceId(voiceId);

      console.log(`Generating speech with ElevenLabs for voice: ${resolvedVoiceId}`);

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${resolvedVoiceId}`,
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
      
      // In development mode, return mock audio instead of failing
      if (isDevelopment) {
        console.warn('[DEV MODE] ElevenLabs API failed, generating mock audio');
        return this.generateMockAudio(options.text);
      }
      
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
   * Resolve voice ID - handle mapping from MongoDB ObjectId to ElevenLabs voice ID
   */
  private async resolveVoiceId(voiceId: string): Promise<string> {
    // If it's already a valid ElevenLabs voice ID format, return it
    if (this.isValidElevenLabsVoiceId(voiceId)) {
      return voiceId;
    }

    // If it's a MongoDB ObjectId, try to resolve it from the database
    if (this.isMongoObjectId(voiceId)) {
      try {
        const { default: Asset } = await import('../models/Asset');
        const asset = await Asset.findById(voiceId);
        
        if (asset && asset.elevenLabsVoiceId) {
          console.log(`Resolved MongoDB voice ID ${voiceId} to ElevenLabs voice ID ${asset.elevenLabsVoiceId}`);
          return asset.elevenLabsVoiceId;
        }
      } catch (error) {
        console.warn(`Failed to resolve voice ID ${voiceId} from database:`, error);
      }
    }

    // Fallback to default voice
    console.warn(`Using default voice for unresolved voice ID: ${voiceId}`);
    return 'pNInz6obpgDQGcFmaJgB'; // Default Adam voice
  }

  /**
   * Check if a string is a valid ElevenLabs voice ID format
   */
  private isValidElevenLabsVoiceId(voiceId: string): boolean {
    // ElevenLabs voice IDs are typically 20-character alphanumeric strings
    return /^[a-zA-Z0-9]{20}$/.test(voiceId);
  }

  /**
   * Check if a string is a MongoDB ObjectId format
   */
  private isMongoObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Generate mock audio for development mode
   */
  private generateMockAudio(text: string): TTSResult {
    // Create a minimal MP3 buffer (silent audio)
    const mockMp3Buffer = Buffer.from([
      0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // ID3 header
      0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // MP3 frame header
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    // Estimate duration based on text length
    const wordCount = text.split(' ').length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);
    
    console.log(`[DEV MODE] Generated mock audio for text: "${text.substring(0, 50)}..."`);
    
    return {
      audioBuffer: mockMp3Buffer,
      duration: estimatedDuration,
      format: 'mp3'
    };
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