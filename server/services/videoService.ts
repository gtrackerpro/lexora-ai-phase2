import Video, { IVideo } from '../models/Video';
import Asset from '../models/Asset';
import Lesson, { ILesson } from '../models/Lesson';
import awsService from './awsService';
import mongoose from 'mongoose';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

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
      // Get avatar and voice assets
      const [avatar, voice] = await Promise.all([
        Asset.findById(avatarId),
        Asset.findById(voiceId)
      ]);

      if (!avatar || !voice) {
        throw new Error('Avatar or voice asset not found');
      }

      // Create video record with generating status
      const video = await Video.create({
        lessonId,
        userId,
        videoUrl: '', // Will be updated after generation
        audioUrl: '', // Will be updated after generation
        avatarId,
        voiceId,
        durationSec: 0, // Will be calculated
        status: 'generating'
      });

      // Start async video generation process
      this.processVideoGeneration((video._id as mongoose.Types.ObjectId).toString(), script, avatar.fileUrl, voice.fileUrl);

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
    voiceUrl: string
  ) {
    try {
      // Generate audio from script using gTTS
      const audioBuffer = await this.generateAudio(script);
      
      // Upload audio to S3
      const audioFileName = `audio_${videoId}_${Date.now()}.mp3`;
      const audioUrl = await awsService.uploadFile(
        audioBuffer,
        audioFileName,
        'audio/mp3',
        'generated/audio'
      );

      // Generate video using Wav2Lip (simplified simulation)
      const videoBuffer = await this.generateVideoWithAvatar(avatarUrl, audioBuffer);
      
      // Upload video to S3
      const videoFileName = `video_${videoId}_${Date.now()}.mp4`;
      const videoUrl = await awsService.uploadFile(
        videoBuffer,
        videoFileName,
        'video/mp4',
        'generated/videos'
      );

      // Calculate duration (simplified - would use actual audio/video analysis)
      const durationSec = Math.max(60, script.length / 10); // Rough estimate

      // Update video record
      await Video.findByIdAndUpdate(videoId, {
        videoUrl,
        audioUrl,
        durationSec,
        status: 'completed'
      });

      console.log(`Video generation completed for ${videoId}`);
    } catch (error) {
      console.error(`Video generation failed for ${videoId}:`, error);
      
      // Update video status to failed
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed'
      });
    }
  }

  private async generateAudio(script: string): Promise<Buffer> {
    // Simulate gTTS audio generation
    // In a real implementation, you would use the actual gTTS library
    // or call an external TTS service
    
    return new Promise((resolve, reject) => {
      // For demo purposes, create a simple audio buffer
      // In production, integrate with actual TTS service
      const mockAudioData = Buffer.alloc(1024 * 100); // 100KB mock audio
      mockAudioData.fill(0x80); // Fill with audio-like data
      
      setTimeout(() => {
        resolve(mockAudioData);
      }, 2000); // Simulate processing time
    });
  }

  private async generateVideoWithAvatar(avatarUrl: string, audioBuffer: Buffer): Promise<Buffer> {
    // Simulate Wav2Lip video generation
    // In a real implementation, you would:
    // 1. Download the avatar image
    // 2. Use Wav2Lip to sync lips with audio
    // 3. Generate the final video
    
    return new Promise((resolve, reject) => {
      // For demo purposes, create a simple video buffer
      // In production, integrate with actual Wav2Lip or similar service
      const mockVideoData = Buffer.alloc(1024 * 1024 * 5); // 5MB mock video
      mockVideoData.fill(0x00); // Fill with video-like data
      
      setTimeout(() => {
        resolve(mockVideoData);
      }, 5000); // Simulate processing time
    });
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

      if (!avatar || !voice) {
        throw new Error('Avatar or voice asset not found');
      }

      // Get the populated lesson to access the script
      const lesson = video.lessonId as unknown as ILesson;
      
      // Start regeneration process
      this.processVideoGeneration(
        videoId, 
        lesson.script, 
        avatar.fileUrl, 
        voice.fileUrl
      );

      return video;
    } catch (error) {
      console.error('Video Regeneration Error:', error);
      throw error;
    }
  }
}

export default new VideoService();