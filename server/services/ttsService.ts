import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Readable } from 'stream';
import awsService from './awsService';

// Import gTTS for local text-to-speech
const gTTS = require('gtts');

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
   * Generate speech using gTTS (local method)
   */
  private async generateWithGTTS(text: string, language: string): Promise<TTSResult> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Generating TTS with gTTS for text:', text.substring(0, 50) + '...');
        
        // Parse language code for gTTS (it expects just the language part)
        const gTTSLanguage = language.split('-')[0]; // 'en-US' -> 'en'
        
        const tempFileName = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
        const tempFilePath = path.join(this.tempDir, tempFileName);

        // Create gTTS instance
        const gtts = new gTTS(text, gTTSLanguage);
        
        // Save to temporary file
        gtts.save(tempFilePath, (err: any) => {
          if (err) {
            console.error('gTTS Save Error:', err);
            reject(new Error(`gTTS generation failed: ${err.message}`));
            return;
          }

          try {
            // Read the generated file
            const audioBuffer = fs.readFileSync(tempFilePath);
            
            // Clean up temp file
            fs.unlink(tempFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.warn('Failed to clean up temp file:', unlinkErr);
              }
            });

            // Estimate duration based on text length
            const wordCount = text.split(' ').length;
            const estimatedDuration = Math.ceil((wordCount / 150) * 60); // ~150 words per minute

            console.log(`gTTS generation completed. Audio size: ${audioBuffer.length} bytes, Duration: ${estimatedDuration}s`);

            resolve({
              audioBuffer,
              duration: estimatedDuration,
              format: 'mp3'
            });
          } catch (readError) {
            console.error('Error reading generated audio file:', readError);
            reject(new Error('Failed to read generated audio file'));
          }
        });
      } catch (error) {
        console.error('gTTS Error:', error);
        reject(new Error(`gTTS initialization failed: ${error}`));
      }
    });
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
      // gTTS supported languages (simplified list)
      { id: 'en', name: 'English', language: 'en', gender: 'neutral' },
      { id: 'es', name: 'Spanish', language: 'es', gender: 'neutral' },
      { id: 'fr', name: 'French', language: 'fr', gender: 'neutral' },
      { id: 'de', name: 'German', language: 'de', gender: 'neutral' },
      { id: 'it', name: 'Italian', language: 'it', gender: 'neutral' },
      { id: 'pt', name: 'Portuguese', language: 'pt', gender: 'neutral' },
      { id: 'ru', name: 'Russian', language: 'ru', gender: 'neutral' },
      { id: 'ja', name: 'Japanese', language: 'ja', gender: 'neutral' },
      { id: 'ko', name: 'Korean', language: 'ko', gender: 'neutral' },
      { id: 'zh', name: 'Chinese', language: 'zh', gender: 'neutral' },
      { id: 'hi', name: 'Hindi', language: 'hi', gender: 'neutral' },
      { id: 'ar', name: 'Arabic', language: 'ar', gender: 'neutral' },
    ];
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
        file.startsWith('tts_')
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

  /**
   * Test TTS functionality
   */
  async testTTS(): Promise<boolean> {
    try {
      const testText = "Hello, this is a test of the text-to-speech system.";
      const result = await this.generateSpeech({ text: testText, language: 'en' });
      
      console.log('TTS Test successful:', {
        audioSize: result.audioBuffer.length,
        duration: result.duration,
        format: result.format
      });
      
      return true;
    } catch (error) {
      console.error('TTS Test failed:', error);
      return false;
    }
  }
}

export default new TTSService();