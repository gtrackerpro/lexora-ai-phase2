import Video, { IVideo } from '../models/Video';
import Asset from '../models/Asset';
import Lesson, { ILesson } from '../models/Lesson';
import avatarVideoService from './avatarVideoService';
import ttsService from './ttsService';
import mongoose from 'mongoose';

interface GenerateVideoParams {
  lessonId: string;
  userId: mongoose.Types.ObjectId;
  script: string;
  avatarId: string;
  voiceId: string;
}

class VideoService {
  async generateVideo(params: GenerateVideoParams) {
    const { lessonId, userId, script, avatarId, voiceId } = params;

    try {
      // Get lesson details
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Get avatar asset (voice preferences will be handled by TTS service)
      const avatar = await Asset.findById(avatarId);
      if (!avatar) {
        throw new Error('Avatar asset not found');
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
        voiceId
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
    voiceId?: string
  ) {
    try {
      console.log(`Starting video generation for ${videoId}`);
      
      // Get voice preferences
      const voiceOptions = await this.getVoiceOptions(voiceId);
      
      // Generate complete lesson video with TTS and avatar
      const result = await avatarVideoService.generateLessonVideo(
        script,
        avatarUrl,
        voiceOptions
      );

      // Update video record with results
      await Video.findByIdAndUpdate(videoId, {
        videoUrl: result.videoUrl,
        audioUrl: result.audioUrl,
        durationSec: result.duration,
        status: 'completed'
      });

      console.log(`Video generation completed for ${videoId}: ${result.duration}s`);
    } catch (error) {
      console.error(`Video generation failed for ${videoId}:`, error);
      
      // Update video status to failed
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed'
      });
    }
  }

  private async getVoiceOptions(voiceId?: string): Promise<any> {
    if (!voiceId) {
      // Return default voice options
      return {
        voice: 'en-US-Standard-D',
        speed: 1.0,
        pitch: 0,
        language: 'en-US'
      };
    }

    try {
      // Get voice asset and extract preferences
      const voiceAsset = await Asset.findById(voiceId);
      if (voiceAsset) {
        // Parse voice preferences from asset metadata or filename
        // This is a simplified implementation
        return {
          voice: 'en-US-Standard-D',
          speed: 1.0,
          pitch: 0,
          language: 'en-US'
        };
      }
    } catch (error) {
      console.error('Error getting voice options:', error);
    }

    // Fallback to default
    return {
      voice: 'en-US-Standard-D',
      speed: 1.0,
      pitch: 0,
      language: 'en-US'
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
        video.voiceId?.toString()
      );

      return video;
    } catch (error) {
      console.error('Video Regeneration Error:', error);
      throw error;
    }
  }

  /**
   * Get available TTS voices
   */
  getAvailableVoices() {
    return ttsService.getAvailableVoices();
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    await Promise.all([
      ttsService.cleanup(),
      avatarVideoService.cleanup()
    ]);
  }
}

export default new VideoService();