import Video, { IVideo } from '../models/Video';
import Asset from '../models/Asset';
import Lesson, { ILesson } from '../models/Lesson';
import axios from 'axios';
import mongoose from 'mongoose';

interface GenerateVideoParams {
  lessonId: string;
  userId: mongoose.Types.ObjectId;
  script: string;
  avatarId: string;
  voiceId: string;
}

interface Wav2LipResponse {
  success: boolean;
  video_url?: string;
  audio_url?: string;
  duration?: number;
  session_id?: string;
  error?: string;
}

class VideoService {
  private wav2lipServiceUrl: string;

  constructor() {
    this.wav2lipServiceUrl = process.env.WAV2LIP_SERVICE_URL || 'http://localhost:5001';
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
      
      // Get avatar asset (voice preferences will be handled by TTS service)
      const avatar = await Asset.findById(avatarId);
      if (!avatar) {
        console.error(`Avatar asset not found with ID: ${avatarId}`);
        throw new Error(`Avatar asset not found with ID: ${avatarId}. Please check if the avatar was uploaded properly.`);
      }
      
      console.log(`Avatar found: ${avatar.fileName} (${avatar.mimeType})`);
      console.log(`Avatar URL: ${avatar.fileUrl}`);
      
      // Validate voiceId if provided
      if (voiceId) {
        console.log(`Looking up voice asset with ID: ${voiceId}`);
        const voice = await Asset.findById(voiceId);
        if (!voice) {
          console.error(`Voice asset not found with ID: ${voiceId}`);
          throw new Error(`Voice asset not found with ID: ${voiceId}. Please check if the voice sample was uploaded properly.`);
        }
        console.log(`Voice found: ${voice.fileName} (${voice.mimeType})`);
      }

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
      console.log(`Starting video generation for ${videoId}`);
      
      // Get voice preferences
      const voiceOptions = await this.getVoiceOptions(voiceId);
      
      // Call Wav2Lip service for video generation
      const result = await this.callWav2LipService({
        script,
        avatar_url: avatarUrl,
        voice_options: voiceOptions,
        lesson_id: videoId,
        lesson_title: lessonTitle
      });

      // Update video record with results
      await Video.findByIdAndUpdate(videoId, {
        videoUrl: result.video_url,
        audioUrl: result.audio_url,
        durationSec: result.duration,
        status: 'completed'
      });

      console.log(`Video generation completed for ${videoId}: ${result.duration || 0}s`);
    } catch (error) {
      console.error(`Video generation failed for ${videoId}:`, error);
      
      // Update video status to failed
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed'
      });
    }
  }

  /**
   * Call the Wav2Lip microservice for video generation
   */
  private async callWav2LipService(params: {
    script: string;
    avatar_url: string;
    voice_options: any;
    lesson_id: string;
    lesson_title?: string;
  }): Promise<Wav2LipResponse> {
    try {
      console.log('Calling Wav2Lip service:', this.wav2lipServiceUrl);
      
      const response = await axios.post<Wav2LipResponse>(
        `${this.wav2lipServiceUrl}/generate-video`,
        params,
        {
          timeout: 300000, // 5 minutes timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Wav2Lip service returned error');
      }

      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Wav2Lip service is not available. Please ensure the service is running.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Video generation timed out. Please try again.');
      } else if (error.response) {
        throw new Error(`Wav2Lip service error: ${error.response.data?.error || error.response.statusText}`);
      } else {
        throw new Error(`Failed to call Wav2Lip service: ${error.message}`);
      }
    }
  }

  /**
   * Check if Wav2Lip service is healthy
   */
  async checkWav2LipHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.wav2lipServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Wav2Lip health check failed:', error);
      return false;
    }
  }

  private async getVoiceOptions(voiceId?: string): Promise<any> {
    if (!voiceId) {
      // Return default voice options
      return {
        language: 'en-US',
        speed: 1.0,
        pitch: 0
      };
    }

    try {
      // Get voice asset and extract preferences
      const voiceAsset = await Asset.findById(voiceId);
      if (voiceAsset) {
        // Parse voice preferences from asset metadata or filename
        // This is a simplified implementation
        return {
          language: 'en-US',
          speed: 1.0,
          pitch: 0
        };
      }
    } catch (error) {
      console.error('Error getting voice options:', error);
    }

    // Fallback to default
    return {
      language: 'en-US',
      speed: 1.0,
      pitch: 0
    };
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

      // Get assets
      const [avatar, voice] = await Promise.all([
        Asset.findById(video.avatarId),
        Asset.findById(video.voiceId)
      ]);

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
   * Get available TTS voices from Wav2Lip service
   */
  async getAvailableVoices() {
    try {
      // For now, return a static list. In the future, this could call the Wav2Lip service
      return [
        { id: 'en-US', name: 'English (US)', language: 'en-US', gender: 'neutral' },
        { id: 'en-GB', name: 'English (UK)', language: 'en-GB', gender: 'neutral' },
        { id: 'es-ES', name: 'Spanish', language: 'es-ES', gender: 'neutral' },
        { id: 'fr-FR', name: 'French', language: 'fr-FR', gender: 'neutral' },
        { id: 'de-DE', name: 'German', language: 'de-DE', gender: 'neutral' },
        { id: 'it-IT', name: 'Italian', language: 'it-IT', gender: 'neutral' },
        { id: 'pt-PT', name: 'Portuguese', language: 'pt-PT', gender: 'neutral' },
        { id: 'ru-RU', name: 'Russian', language: 'ru-RU', gender: 'neutral' },
        { id: 'ja-JP', name: 'Japanese', language: 'ja-JP', gender: 'neutral' },
        { id: 'ko-KR', name: 'Korean', language: 'ko-KR', gender: 'neutral' },
        { id: 'zh-CN', name: 'Chinese', language: 'zh-CN', gender: 'neutral' },
        { id: 'hi-IN', name: 'Hindi', language: 'hi-IN', gender: 'neutral' },
        { id: 'ar-SA', name: 'Arabic', language: 'ar-SA', gender: 'neutral' }
      ];
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    try {
      // Call cleanup endpoint on Wav2Lip service
      await axios.post(`${this.wav2lipServiceUrl}/cleanup`, {}, {
        timeout: 10000
      });
      console.log('Wav2Lip service cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup Wav2Lip service:', error);
    }
  }
}

export default new VideoService();