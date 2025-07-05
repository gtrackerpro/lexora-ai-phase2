import { Response } from 'express';
import LearningPath from '../models/LearningPath';
import Topic from '../models/Topic';

// @desc    Create new learning path
// @route   POST /api/learning-paths
// @access  Private
export const createLearningPath = async (req: Request, res: Response) => {
  try {
    const { topicId, title, description, weeks, estimatedTotalHours, difficulty, goal } = req.body;

    // Verify topic exists and belongs to user
    const topic = await Topic.findById(topicId);
    if (!topic || topic.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const learningPath = await LearningPath.create({
      topicId,
      userId: req.user?._id,
      title,
      description,
      weeks,
      estimatedTotalHours,
      difficulty,
      goal
    });

    res.status(201).json({
      success: true,
      learningPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get learning paths for a topic
// @route   GET /api/topics/:topicId/learning-paths
// @access  Private
export const getLearningPathsByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    // Verify topic exists and belongs to user
    const topic = await Topic.findById(topicId);
    if (!topic || topic.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    const learningPaths = await LearningPath.find({ 
      topicId, 
      userId: req.user?._id 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: learningPaths.length,
      learningPaths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single learning path
// @route   GET /api/learning-paths/:id
// @access  Private
export const getLearningPath = async (req: Request, res: Response) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id)
      .populate('topicId', 'title description')
      .populate('userId', 'displayName');

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Check if user owns the learning path
    if (learningPath.userId._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this learning path'
      });
    }

    res.status(200).json({
      success: true,
      learningPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};