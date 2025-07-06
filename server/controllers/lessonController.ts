import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import LearningPath from '../models/LearningPath';
import Video from '../models/Video';
import groqService from '../services/groqService';
import videoService from '../services/videoService';
import lessonGenerationService from '../services/lessonGenerationService';

// @desc    Create new lesson
// @route   POST /api/lessons
// @access  Private
export const createLesson = async (req: Request, res: Response) => {
  try {
    const { learningPathId, title, week, day, objectives } = req.body;

    // Verify learning path exists and belongs to user
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath || learningPath.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Generate lesson content using AI
    const content = await groqService.generateLessonContent(
      learningPath.title,
      title,
      objectives
    );

    // Generate narration script
    const script = await groqService.generateLessonScript(content);

    const lesson = await Lesson.create({
      learningPathId,
      topicId: learningPath.topicId,
      userId: req.user?._id,
      title,
      week,
      day,
      content,
      script,
      objectives,
      status: 'finalized'
    });

    res.status(201).json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Lesson Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson'
    });
  }
};

// @desc    Generate lessons for learning path
// @route   POST /api/learning-paths/:pathId/generate-lessons
// @access  Private
export const generateLessonsForPath = async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;
    const { week } = req.body; // Optional: generate for specific week

    // Verify learning path exists and belongs to user
    const learningPath = await LearningPath.findById(pathId);
    if (!learningPath || learningPath.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    let lessons;
    if (week) {
      // Generate lessons for specific week
      lessons = await lessonGenerationService.generateWeekLessons(
        pathId,
        parseInt(week),
        req.user?._id
      );
    } else {
      // Generate all lessons
      lessons = await lessonGenerationService.generateAllLessons(
        pathId,
        req.user?._id
      );
    }

    res.status(201).json({
      success: true,
      count: lessons.length,
      lessons,
      message: `Generated ${lessons.length} lessons successfully`
    });
  } catch (error) {
    console.error('Generate Lessons Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate lessons'
    });
  }
};

// @desc    Regenerate lesson content
// @route   POST /api/lessons/:id/regenerate
// @access  Private
export const regenerateLessonContent = async (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const updatedLesson = await lessonGenerationService.regenerateLesson(lessonId);

    res.status(200).json({
      success: true,
      lesson: updatedLesson,
      message: 'Lesson content regenerated successfully'
    });
  } catch (error) {
    console.error('Regenerate Lesson Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate lesson content'
    });
  }
};

// @desc    Get lessons for a learning path
// @route   GET /api/learning-paths/:pathId/lessons
// @access  Private
export const getLessonsByPath = async (req: Request, res: Response) => {
  try {
    const { pathId } = req.params;

    // Verify learning path exists and belongs to user
    const learningPath = await LearningPath.findById(pathId);
    if (!learningPath || learningPath.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const lessons = await Lesson.find({ 
      learningPathId: pathId,
      userId: req.user?._id 
    }).sort({ week: 1, day: 1 });

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    console.error('Get Lessons Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('learningPathId', 'title description')
      .populate('topicId', 'title');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user owns the lesson
    if (lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lesson'
      });
    }

    // Get associated video if exists
    const video = await Video.findOne({ lessonId: lesson._id });

    res.status(200).json({
      success: true,
      lesson,
      video
    });
  } catch (error) {
    console.error('Get Lesson Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
};

// @desc    Generate video for lesson
// @route   POST /api/lessons/:id/generate-video
// @access  Private
export const generateLessonVideo = async (req: Request, res: Response) => {
  try {
    const { avatarId, voiceId } = req.body;
    const lessonId = req.params.id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ lessonId });
    if (existingVideo) {
      return res.status(400).json({
        success: false,
        message: 'Video already exists for this lesson'
      });
    }

    // Start video generation process
    const video = await videoService.generateVideo({
      lessonId,
      userId: req.user?._id,
      script: lesson.script,
      avatarId,
      voiceId
    });

    res.status(201).json({
      success: true,
      video,
      message: 'Video generation started'
    });
  } catch (error) {
    console.error('Video Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start video generation'
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { title, content, script, objectives } = req.body;

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user owns the lesson
    if (lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lesson'
      });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, content, script, objectives },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      lesson: updatedLesson
    });
  } catch (error) {
    console.error('Update Lesson Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson'
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if user owns the lesson
    if (lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lesson'
      });
    }

    // Delete associated video
    await Video.deleteMany({ lessonId: lesson._id });

    // Delete the lesson
    await Lesson.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete Lesson Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson'
    });
  }
};