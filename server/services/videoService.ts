import Video, { IVideo } from '../models/Video';
import Asset from '../models/Asset';
import Lesson, { ILesson } from '../models/Lesson';
import ttsService from './ttsService';
import awsService from './awsService';
import axios from 'axios';
import mongoose from 'mongoose';
import { hasApiKey, isDevelopment } from '../utils/devConfig';

interface GenerateVideoParams {
  lessonId: string;
  userId: mongoose.Types.ObjectId;
  script: string;
  avatarId: string;
  voiceId: string;
}

interface DIDCreateTalkRequest {
  source_url: string;
  script: {
    type: 'audio';
    audio_url: string;
  } | {
    type: 'text';
    input: string;
    provider: {
      type: 'elevenlabs';
      voice_id: string;
    };
  };
  config?: {
    fluent?: boolean;
    pad_audio?: number;
    stitch?: boolean;
    result_format?: 'mp4' | 'gif' | 'mov';
  };
}

interface DIDTalkResponse {
  id: string;
  object: string;
  created_at: string;
  status: 'created' | 'started' | 'done' | 'error' | 'rejected';
  result_url?: string;
  error?: {
    type: string;
    description: string;
  };
  metadata?: {
    driver_url?: string;
    mouth_open?: string;
    num_faces?: number;
    num_frames?: number;
    processing_fps?: number;
    resolution?: [number, number];
    size_kib?: number;
    duration?: number;
  };
}

class VideoService {
  private didApiKey: string;
  private didBaseUrl: string;

  constructor() {
    this.didApiKey = process.env.D_ID_API_KEY || '';
    this.didBaseUrl = process.env.D_ID_BASE_URL || 'https://api.d-id.com';

    if (!this.didApiKey) {
      console.warn('D_ID_API_KEY not found in environment variables');
    }
  }

  async generateVideo(params: GenerateVideoParams) {
    const { lessonId, userId, script, avatarId, voiceId } = params;

    try {
      // Get lesson details
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      console.log(`Looking up avatar asset with ID: ${avatarId}`);
      
      // Get avatar asset
      const avatar = await Asset.findById(avatarId);
      if (!avatar) {
        console.error(`Avatar asset not found with ID: ${avatarId}`);
        throw new Error(`Avatar asset not found with ID: ${avatarId}. Please check if the avatar was uploaded properly.`);
      }
      
      console.log(`Avatar found: ${avatar.fileName} (${avatar.mimeType})`);
      console.log(`Avatar URL: ${avatar.fileUrl}`);

      // Create video record with generating status
      const video = await Video.create({
        lessonId,
        userId,
        videoUrl: '',
        audioUrl: '',
        avatarId,
        voiceId: voiceId || null,
        durationSec: 0,
        status: 'generating'
      });

      // Start async video generation
      this.processVideoGeneration(
        (video._id as mongoose.Types.ObjectId).toString(),
        script,
        avatar.fileUrl,
        voiceId,
        lesson.title
      );

      return video;
    } catch (error) {
      console.error('Video Generation Error:', error);
      throw error;
    }
  }

  private async processVideoGeneration(
    videoId: string, 
    script: string, 
    avatarUrl: string,
    voiceId?: string,
    lessonTitle?: string
  ) {
    try {
      console.log(`Starting D-ID video generation for ${videoId}`);
      
      // Method 1: Generate audio first with ElevenLabs, then use D-ID with audio URL
      const audioResult = await this.generateAudioFirst(script, voiceId, videoId);
      
      if (audioResult.success && audioResult.audioUrl) {
        // Use D-ID with pre-generated audio
        const didResult = await this.createDIDTalkWithAudio(avatarUrl, audioResult.audioUrl);
        await this.pollDIDStatus(videoId, didResult.id, audioResult.audioUrl, audioResult.duration);
      } else {
        // Fallback: Use D-ID with text and ElevenLabs integration
        const didResult = await this.createDIDTalkWithText(avatarUrl, script, voiceId);
        await this.pollDIDStatus(videoId, didResult.id);
      }

    } catch (error) {
      console.error(`Video generation failed for ${videoId}:`, error);
      
      // Update video status to failed
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed'
      });
    }
  }

  /**
   * Method 1: Generate audio with ElevenLabs first, then use D-ID
   */
  private async generateAudioFirst(script: string, voiceId?: string, videoId?: string): Promise<{
    success: boolean;
    audioUrl?: string;
    duration?: number;
  }> {
    try {
      console.log('Generating audio with ElevenLabs first...');
      
      const audioResult = await ttsService.generateAndUploadSpeech(
        script,
        `lesson_audio_${videoId || Date.now()}`,
        { voiceId }
      );

      return {
        success: true,
        audioUrl: audioResult.audioUrl,
        duration: audioResult.duration
      };
    } catch (error) {
      console.error('Failed to generate audio first:', error);
      return { success: false };
    }
  }

  /**
   * Create D-ID talk with pre-generated audio
   */
  private async createDIDTalkWithAudio(avatarUrl: string, audioUrl: string): Promise<DIDTalkResponse> {
    const requestBody: DIDCreateTalkRequest = {
      source_url: avatarUrl,
      script: {
        type: 'audio',
        audio_url: audioUrl
      },
      config: {
        fluent: false,
        pad_audio: 0.0,
        stitch: true,
        result_format: 'mp4'
      }
    };

    return await this.makeDIDRequest(requestBody);
  }

  /**
   * Create D-ID talk with text (fallback method)
   */
  private async createDIDTalkWithText(avatarUrl: string, script: string, voiceId?: string): Promise<DIDTalkResponse> {
    const requestBody: DIDCreateTalkRequest = {
      source_url: avatarUrl,
      script: {
        type: 'text',
        input: script,
        provider: {
          type: 'elevenlabs',
          voice_id: voiceId || 'pNInz6obpgDQGcFmaJgB' // Default Adam voice
        }
      },
      config: {
        fluent: false,
        pad_audio: 0.0,
        stitch: true,
        result_format: 'mp4'
      }
    };

    return await this.makeDIDRequest(requestBody);
  }

  /**
   * Make the actual D-ID API request
   */
  private async makeDIDRequest(requestBody: DIDCreateTalkRequest): Promise<DIDTalkResponse> {
    try {
      // Check if API key is available
      if (!hasApiKey('D_ID_API_KEY')) {
        if (isDevelopment) {
          console.warn('[DEV MODE] D-ID API key not configured, returning mock response');
          return this.generateMockVideoResponse();
        }
        throw new Error('D-ID API key not configured');
      }

      console.log('Creating D-ID talk with request:', JSON.stringify(requestBody, null, 2));
      console.log('Using D-ID API key:', this.didApiKey ? 'configured' : 'not configured');
      console.log('D-ID Base URL:', this.didBaseUrl);

      const response = await axios.post<DIDTalkResponse>(
        `${this.didBaseUrl}/talks`,
        requestBody,
        {
          headers: {
            'Authorization': `Basic ${this.didApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log(`D-ID talk created with ID: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error('D-ID API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? { ...error.config.headers, Authorization: '[REDACTED]' } : undefined
        }
      });
      
      // Handle specific D-ID errors - in development mode, fall back to mock for server errors
      if (error.response?.status === 402) {
        throw new Error('D-ID API: Insufficient credits. Please check your D-ID account balance.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('D-ID API: Authentication failed. Please check your API key.');
      }
      
      if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.error?.description || error.response?.data?.detail || 'Invalid request';
        throw new Error(`D-ID API: ${errorDetail}`);
      }
      
      if (error.response?.status === 500) {
        if (isDevelopment) {
          console.warn('[DEV MODE] D-ID API server error, returning mock response');
          return this.generateMockVideoResponse();
        }
        throw new Error('D-ID API: Internal server error. Please try again later.');
      }
      
      // For development mode, fall back to mock response for any D-ID API error
      if (isDevelopment) {
        console.warn(`[DEV MODE] D-ID API error (${error.response?.status || 'unknown'}), returning mock response`);
        return this.generateMockVideoResponse();
      }
      
      throw new Error(`D-ID API failed: ${error.response?.data?.error?.description || error.message}`);
    }
  }

  /**
   * Poll D-ID status until video is ready
   */
  private async pollDIDStatus(
    videoId: string, 
    didTalkId: string, 
    audioUrl?: string, 
    duration?: number
  ): Promise<void> {
    // Handle development mode with mock response
    if (isDevelopment && didTalkId.startsWith('mock_')) {
      console.log(`[DEV MODE] Simulating video completion for ${videoId}`);
      setTimeout(async () => {
        await Video.findByIdAndUpdate(videoId, {
          videoUrl: 'https://example.com/mock-video.mp4',
          audioUrl: audioUrl || 'https://example.com/mock-audio.mp3',
          durationSec: duration || 30,
          status: 'completed'
        });
        console.log(`[DEV MODE] Mock video generation completed for ${videoId}`);
      }, 3000); // 3 second delay to simulate processing
      return;
    }

    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        console.log(`Polling D-ID status for talk ${didTalkId}, attempt ${attempts}/${maxAttempts}`);

        const response = await axios.get<DIDTalkResponse>(
          `${this.didBaseUrl}/talks/${didTalkId}`,
          {
            headers: {
              'Authorization': `Basic ${this.didApiKey}`
            },
            timeout: 10000
          }
        );

        const talk = response.data;
        console.log(`D-ID talk status: ${talk.status}`);

        switch (talk.status) {
          case 'done':
            // Video generation completed successfully
            await Video.findByIdAndUpdate(videoId, {
              videoUrl: talk.result_url,
              audioUrl: audioUrl || talk.result_url, // Use audio URL if available, otherwise video URL
              durationSec: duration || talk.metadata?.duration || 60,
              status: 'completed'
            });
            console.log(`Video generation completed for ${videoId}: ${talk.result_url}`);
            break;

          case 'error':
          case 'rejected':
            // Video generation failed
            const errorMessage = talk.error?.description || 'Unknown error';
            console.error(`D-ID video generation failed: ${errorMessage}`);
            await Video.findByIdAndUpdate(videoId, {
              status: 'failed'
            });
            break;

          case 'created':
          case 'started':
            // Still processing, continue polling
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000); // Poll every 5 seconds
            } else {
              // Timeout reached
              console.error(`D-ID video generation timed out for ${videoId}`);
              await Video.findByIdAndUpdate(videoId, {
                status: 'failed'
              });
            }
            break;

          default:
            console.warn(`Unknown D-ID status: ${talk.status}`);
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000);
            } else {
              await Video.findByIdAndUpdate(videoId, {
                status: 'failed'
              });
            }
        }
      } catch (error) {
        console.error(`Error polling D-ID status:`, error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Retry on error
        } else {
          await Video.findByIdAndUpdate(videoId, {
            status: 'failed'
          });
        }
      }
    };

    // Start polling
    setTimeout(poll, 2000); // Initial delay of 2 seconds
  }

  /**
   * Check D-ID service health
   */
  async checkDIDHealth(): Promise<boolean> {
    try {
      // D-ID doesn't have a dedicated health endpoint, so we'll check credits
      const response = await axios.get(`${this.didBaseUrl}/credits`, {
        headers: {
          'Authorization': `Basic ${this.didApiKey}`
        },
        timeout: 5000
      });
      
      console.log('D-ID service is healthy, credits:', response.data);
      return true;
    } catch (error) {
      console.error('D-ID health check failed:', error);
      return false;
    }
  }

  async getVideoStatus(videoId: string) {
    try {
      const video = await Video.findById(videoId);
      return video;
    } catch (error) {
      console.error('Get Video Status Error:', error);
      throw error;
    }
  }

  async regenerateVideo(videoId: string) {
    try {
      const video = await Video.findById(videoId).populate('lessonId');
      if (!video) {
        throw new Error('Video not found');
      }

      // Reset status to generating
      video.status = 'generating';
      await video.save();

      // Get avatar asset
      const avatar = await Asset.findById(video.avatarId);
      if (!avatar) {
        throw new Error('Avatar asset not found');
      }

      // Get the populated lesson to access the script
      const lesson = video.lessonId as unknown as ILesson;
      
      // Start regeneration process
      this.processVideoGeneration(
        videoId, 
        lesson.script, 
        avatar.fileUrl,
        video.voiceId?.toString(),
        lesson.title
      );

      return video;
    } catch (error) {
      console.error('Video Regeneration Error:', error);
      throw error;
    }
  }

  /**
   * Get available voices (from ElevenLabs via TTS service)
   */
  async getAvailableVoices() {
    try {
      return await ttsService.getAvailableVoices();
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  /**
   * Generate mock video response for development mode
   */
  private generateMockVideoResponse(): DIDTalkResponse {
    const mockId = `mock_${Date.now()}`;
    console.log(`[DEV MODE] Generated mock D-ID response with ID: ${mockId}`);
    
    return {
      id: mockId,
      object: 'talk',
      created_at: new Date().toISOString(),
      status: 'done',
      result_url: 'https://example.com/mock-video.mp4',
      metadata: {
        duration: 30,
        size_kib: 1024,
        resolution: [512, 512],
        num_frames: 750,
        processing_fps: 25
      }
    };
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    try {
      await ttsService.cleanup();
      console.log('Video service cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup video service:', error);
    }
  }
}

export default new VideoService();