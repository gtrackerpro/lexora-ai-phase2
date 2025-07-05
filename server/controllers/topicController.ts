import { Response } from 'express';
import Topic from '../models/Topic';
import { AuthRequest } from '../middleware/auth';

// @desc    Create new topic
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, tags } = req.body;

    const topic = await Topic.create({
      title,
      description,
      tags,
      createdBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Private
export const getTopics = async (req: AuthRequest, res: Response) => {
  try {
    const topics = await Topic.find({ createdBy: req.user?._id })
      .populate('createdBy', 'displayName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single topic
// @route   GET /api/topics/:id
// @access  Private
export const getTopic = async (req: AuthRequest, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('createdBy', 'displayName');

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if user owns the topic
    if (topic.createdBy._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this topic'
      });
    }

    res.status(200).json({
      success: true,
      topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};