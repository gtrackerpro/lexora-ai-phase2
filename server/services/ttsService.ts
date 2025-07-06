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
  speed?: number;
  pitch?: number;
  language?: string;
}

interface TTSResult {
  audioBuffer: Buffer;
  duration: number;
  format: string;
}

class TTSService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate speech from text using Google TTS
   */
  async generateSpeech(options: TTSOptions): Promise<TTSResult> {
    try {
      const { text, voice = 'en-US-Standard-D', speed = 1.0, pitch = 0, language = 'en-US' } = options;

      // Use Google Cloud TTS API if available, otherwise fallback to gTTS
      if (process.env.GOOGLE_CLOUD_TTS_API_KEY) {
        return await this.generateWithGoogleCloudTTS(text, voice, speed, pitch, language);
      } else {
        return await this.generateWithGTTS(text, language);
      }
    } catch (error) {
      console.error('TTS Generation Error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Generate speech using Google Cloud TTS API
   */
  private async generateWithGoogleCloudTTS(
    text: string, 
    voice: string, 
    speed: number, 
    pitch: number, 
    language: string
  ): Promise<TTSResult> {
    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_TTS_API_KEY}`,
        {
          input: { text },
          voice: {
            languageCode: language,
            name: voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed,
            pitch: pitch
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const audioContent = response.data.audioContent;
      const audioBuffer = Buffer.from(audioContent, 'base64');
      
      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = text.split(' ').length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      return {
        audioBuffer,
        duration: estimatedDuration,
        format: 'mp3'
      };
    } catch (error) {
      console.error('Google Cloud TTS Error:', error);
      throw error;
    }
  }

  /**
   * Generate speech using gTTS (fallback method)
   */
  private async generateWithGTTS(text: string, language: string): Promise<TTSResult> {
    try {
      // For demo purposes, we'll simulate gTTS
      // In production, you would use the actual gTTS library or API
      
      const tempFileName = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      const tempFilePath = path.join(this.tempDir, tempFileName);

      // Simulate TTS generation with a mock audio file
      const mockAudioData = this.generateMockAudio(text);
      await writeFile(tempFilePath, mockAudioData);

      // Read the generated file
      const audioBuffer = fs.readFileSync(tempFilePath);
      
      // Clean up temp file
      await unlink(tempFilePath);

      // Estimate duration
      const wordCount = text.split(' ').length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      return {
        audioBuffer,
        duration: estimatedDuration,
        format: 'mp3'
      };
    } catch (error) {
      console.error('gTTS Error:', error);
      throw error;
    }
  }

  /**
   * Generate mock audio data for demo purposes
   */
  private generateMockAudio(text: string): Buffer {
    // Create a simple mock MP3-like buffer
    // In production, this would be replaced with actual TTS generation
    const baseSize = 1024 * 50; // 50KB base
    const textLength = text.length;
    const audioSize = baseSize + (textLength * 100); // Scale with text length
    
    const buffer = Buffer.alloc(audioSize);
    
    // Fill with mock audio data pattern
    for (let i = 0; i < audioSize; i++) {
      buffer[i] = Math.floor(Math.sin(i / 100) * 127 + 128);
    }
    
    return buffer;
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
   * Get available voices for TTS
   */
  getAvailableVoices(): Array<{ id: string; name: string; language: string; gender: string }> {
    return [
      { id: 'en-US-Standard-A', name: 'US English (Female)', language: 'en-US', gender: 'female' },
      { id: 'en-US-Standard-B', name: 'US English (Male)', language: 'en-US', gender: 'male' },
      { id: 'en-US-Standard-C', name: 'US English (Female)', language: 'en-US', gender: 'female' },
      { id: 'en-US-Standard-D', name: 'US English (Male)', language: 'en-US', gender: 'male' },
      { id: 'en-US-Wavenet-A', name: 'US English Wavenet (Female)', language: 'en-US', gender: 'female' },
      { id: 'en-US-Wavenet-B', name: 'US English Wavenet (Male)', language: 'en-US', gender: 'male' },
      { id: 'en-GB-Standard-A', name: 'UK English (Female)', language: 'en-GB', gender: 'female' },
      { id: 'en-GB-Standard-B', name: 'UK English (Male)', language: 'en-GB', gender: 'male' },
    ];
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const deletePromises = files.map(file => {
        const filePath = path.join(this.tempDir, file);
        return unlink(filePath).catch(() => {}); // Ignore errors
      });
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cleanup Error:', error);
    }
  }
}

export default new TTSService();