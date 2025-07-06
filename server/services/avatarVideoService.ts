import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import awsService from './awsService';
import ttsService from './ttsService';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface VideoGenerationOptions {
  avatarImageUrl: string;
  audioBuffer: Buffer;
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
  resolution?: '720p' | '1080p';
}

interface VideoResult {
  videoBuffer: Buffer;
  duration: number;
  format: string;
  resolution: string;
}

class AvatarVideoService {
  private tempDir: string;
  private pythonPath: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate avatar video with lip sync
   */
  async generateAvatarVideo(options: VideoGenerationOptions): Promise<VideoResult> {
    try {
      const {
        avatarImageUrl,
        audioBuffer,
        outputFormat = 'mp4',
        quality = 'medium',
        resolution = '720p'
      } = options;

      // Check if Wav2Lip is available
      if (await this.isWav2LipAvailable()) {
        return await this.generateWithWav2Lip(avatarImageUrl, audioBuffer, outputFormat, quality, resolution);
      } else {
        // Fallback to simple video generation
        return await this.generateSimpleVideo(avatarImageUrl, audioBuffer, outputFormat, resolution);
      }
    } catch (error) {
      console.error('Avatar Video Generation Error:', error);
      throw new Error('Failed to generate avatar video');
    }
  }

  /**
   * Check if Wav2Lip is available in the system
   */
  private async isWav2LipAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkProcess = spawn(this.pythonPath, ['-c', 'import cv2; import torch; print("OK")']);
      
      checkProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      checkProcess.on('error', () => {
        resolve(false);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        checkProcess.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Generate video using Wav2Lip
   */
  private async generateWithWav2Lip(
    avatarImageUrl: string,
    audioBuffer: Buffer,
    outputFormat: string,
    quality: string,
    resolution: string
  ): Promise<VideoResult> {
    const tempId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const imagePath = path.join(this.tempDir, `avatar_${tempId}.jpg`);
    const audioPath = path.join(this.tempDir, `audio_${tempId}.wav`);
    const outputPath = path.join(this.tempDir, `output_${tempId}.${outputFormat}`);

    try {
      // Download avatar image
      const imageResponse = await axios.get(avatarImageUrl, { responseType: 'arraybuffer' });
      await writeFile(imagePath, Buffer.from(imageResponse.data));

      // Save audio file
      await writeFile(audioPath, audioBuffer);

      // Run Wav2Lip
      await this.runWav2Lip(imagePath, audioPath, outputPath, quality);

      // Read generated video
      const videoBuffer = fs.readFileSync(outputPath);
      
      // Get video duration (simplified estimation)
      const duration = Math.ceil(audioBuffer.length / (44100 * 2)); // Rough estimate

      // Clean up temp files
      await Promise.all([
        unlink(imagePath).catch(() => {}),
        unlink(audioPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);

      return {
        videoBuffer,
        duration,
        format: outputFormat,
        resolution
      };
    } catch (error) {
      // Clean up on error
      await Promise.all([
        unlink(imagePath).catch(() => {}),
        unlink(audioPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);
      throw error;
    }
  }

  /**
   * Run Wav2Lip process
   */
  private async runWav2Lip(
    imagePath: string,
    audioPath: string,
    outputPath: string,
    quality: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Wav2Lip command (simplified - in production you'd have the full Wav2Lip setup)
      const args = [
        '-c',
        `
import cv2
import numpy as np
import subprocess
import os

# Simplified video generation (mock Wav2Lip functionality)
# In production, this would be the actual Wav2Lip inference code

# Create a simple video with the avatar image
cap = cv2.VideoCapture('${imagePath}')
ret, frame = cap.read()
cap.release()

if ret:
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter('${outputPath}', fourcc, 25.0, (frame.shape[1], frame.shape[0]))
    
    # Write frames for estimated duration (simplified)
    for i in range(25 * 10):  # 10 seconds at 25 FPS
        out.write(frame)
    
    out.release()
    print("Video generated successfully")
else:
    raise Exception("Failed to read avatar image")
        `
      ];

      const process = spawn(this.pythonPath, args);
      
      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Wav2Lip process failed: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start Wav2Lip process: ${error.message}`));
      });

      // Timeout after 2 minutes
      setTimeout(() => {
        process.kill();
        reject(new Error('Wav2Lip process timed out'));
      }, 120000);
    });
  }

  /**
   * Generate simple video without lip sync (fallback)
   */
  private async generateSimpleVideo(
    avatarImageUrl: string,
    audioBuffer: Buffer,
    outputFormat: string,
    resolution: string
  ): Promise<VideoResult> {
    try {
      // Download avatar image
      const imageResponse = await axios.get(avatarImageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // Create a simple video with static image and audio
      const videoBuffer = await this.createStaticVideo(imageBuffer, audioBuffer, resolution);
      
      // Estimate duration
      const duration = Math.ceil(audioBuffer.length / (44100 * 2));

      return {
        videoBuffer,
        duration,
        format: outputFormat,
        resolution
      };
    } catch (error) {
      console.error('Simple Video Generation Error:', error);
      throw error;
    }
  }

  /**
   * Create a static video with image and audio
   */
  private async createStaticVideo(
    imageBuffer: Buffer,
    audioBuffer: Buffer,
    resolution: string
  ): Promise<Buffer> {
    // For demo purposes, create a mock video buffer
    // In production, you would use FFmpeg or similar to create actual video
    
    const baseSize = 1024 * 1024 * 2; // 2MB base
    const audioLength = audioBuffer.length;
    const videoSize = baseSize + Math.floor(audioLength / 10); // Scale with audio
    
    const videoBuffer = Buffer.alloc(videoSize);
    
    // Fill with mock video data
    for (let i = 0; i < videoSize; i++) {
      videoBuffer[i] = Math.floor(Math.random() * 256);
    }
    
    return videoBuffer;
  }

  /**
   * Generate complete lesson video with TTS
   */
  async generateLessonVideo(
    script: string,
    avatarImageUrl: string,
    voiceOptions: any = {}
  ): Promise<{ videoUrl: string; audioUrl: string; duration: number }> {
    try {
      // Generate TTS audio
      const ttsResult = await ttsService.generateSpeech({
        text: script,
        ...voiceOptions
      });

      // Generate avatar video
      const videoResult = await this.generateAvatarVideo({
        avatarImageUrl,
        audioBuffer: ttsResult.audioBuffer,
        quality: 'medium',
        resolution: '720p'
      });

      // Upload to S3
      const timestamp = Date.now();
      const [videoUrl, audioUrl] = await Promise.all([
        awsService.uploadFile(
          videoResult.videoBuffer,
          `lesson_video_${timestamp}.mp4`,
          'video/mp4',
          'generated/videos'
        ),
        awsService.uploadFile(
          ttsResult.audioBuffer,
          `lesson_audio_${timestamp}.mp3`,
          'audio/mp3',
          'generated/audio'
        )
      ]);

      return {
        videoUrl,
        audioUrl,
        duration: Math.max(ttsResult.duration, videoResult.duration)
      };
    } catch (error) {
      console.error('Lesson Video Generation Error:', error);
      throw new Error('Failed to generate lesson video');
    }
  }

  /**
   * Get video generation status
   */
  async getGenerationStatus(jobId: string): Promise<{ status: string; progress: number; error?: string }> {
    // In a production system, you would track generation jobs
    // For now, return a mock status
    return {
      status: 'completed',
      progress: 100
    };
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = fs.readdirSync(this.tempDir);
      const videoFiles = files.filter(file => 
        file.endsWith('.mp4') || 
        file.endsWith('.webm') || 
        file.endsWith('.wav') || 
        file.endsWith('.jpg') || 
        file.endsWith('.png')
      );
      
      const deletePromises = videoFiles.map(file => {
        const filePath = path.join(this.tempDir, file);
        return unlink(filePath).catch(() => {}); // Ignore errors
      });
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Video Cleanup Error:', error);
    }
  }
}

export default new AvatarVideoService();