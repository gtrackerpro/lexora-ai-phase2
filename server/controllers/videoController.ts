import { Request, Response } from 'express';
import Video from '../models/Video';
import Lesson from '../models/Lesson';
import videoService from '../services/videoService';

// @desc    Get videos for a lesson
// @route   GET /api/lessons/:lessonId/videos
// @access  Private
export const getVideosByLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    // Verify lesson exists and belongs to user
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const videos = await Video.find({ 
      lessonId,
      userId: req.user?._id 
    }).populate('avatarId voiceId');

    res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Get Videos Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('lessonId', 'title content')
      .populate('avatarId voiceId');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user owns the video
    if (video.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this video'
      });
    }

    res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Get Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
};

// @desc    Update video status
// @route   PUT /api/videos/:id/status
// @access  Private
export const updateVideoStatus = async (req: Request, res: Response) => {
  try {
    const { status, videoUrl, durationSec } = req.body;

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user owns the video
    if (video.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this video'
      });
    }

    const updateData: any = { status };
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (durationSec) updateData.durationSec = durationSec;

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update Video Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video status'
    });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Check if user owns the video
    if (video.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this video'
      });
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete Video Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
};

// @desc    Get available TTS voices
// @route   GET /api/videos/voices
// @access  Private
export const getAvailableVoices = async (req: Request, res: Response) => {
  try {
    const voices = await import('../services/ttsService').then(module => 
      module.default.getAvailableVoices()
    );
    
    res.status(200).json({
      success: true,
      voices
    });
  } catch (error) {
    console.error('Get Voices Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available voices'
    });
  }
};

// @desc    Clean up temporary files
// @route   POST /api/videos/cleanup
// @access  Private
export const cleanupTempFiles = async (req: Request, res: Response) => {
  try {
    await videoService.cleanup();
    
    res.status(200).json({
      success: true,
      message: 'Temporary files cleaned up successfully'
    });
  } catch (error) {
    console.error('Cleanup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up temporary files'
    });
  }
};