import { Request, Response } from 'express';
import Topic from '../models/Topic';
import LearningPath from '../models/LearningPath';
import groqService from '../services/groqService';
import lessonGenerationService from '../services/lessonGenerationService';

// @desc    Create new topic with AI-generated learning path
// @route   POST /api/topics
// @access  Private
export const createTopic = async (req: Request, res: Response) => {
  try {
    const { title, description, tags, difficulty, weeks, goals } = req.body;

    // Create the topic first
    const topic = await Topic.create({
      title,
      description,
      tags,
      createdBy: req.user?._id
    });

    // Generate AI learning path using Groq
    try {
      const aiLearningPath = await groqService.generateLearningPath(
        title,
        difficulty || 'Beginner',
        weeks || 6,
        goals || description
      );

      // Create learning path from AI response
      const learningPath = await LearningPath.create({
        topicId: topic._id,
        userId: req.user?._id,
        title: aiLearningPath.title || title,
        description: aiLearningPath.description || description,
        weeks: weeks || 6,
        estimatedTotalHours: aiLearningPath.estimatedTotalHours || (weeks || 6) * 5,
        difficulty: difficulty || 'Beginner',
        goal: goals || description
      });

      // Generate lessons for the learning path
      try {
        console.log('Starting lesson generation for learning path:', learningPath._id);
        const lessons = await lessonGenerationService.generateAllLessons(
          learningPath._id.toString(),
          req.user?._id
        );
        console.log(`Generated ${lessons.length} lessons for learning path`);
        
        res.status(201).json({
          success: true,
          topic,
          learningPath,
          lessons,
          aiContent: aiLearningPath,
          message: `Learning path created with ${lessons.length} AI-generated lessons!`
        });
      } catch (lessonError) {
        console.error('Lesson Generation Error:', lessonError);
        // Return success even if lesson generation fails
        res.status(201).json({
          success: true,
          topic,
          learningPath,
          aiContent: aiLearningPath,
          message: 'Learning path created successfully. Lessons will be generated in the background.'
        });
      }
    } catch (aiError) {
      res.status(201).json({
        success: true,
        topic,
        learningPath,
        message: 'Topic created successfully. AI content generation will be retried.'
      });
    }
  } catch (error) {
    console.error('Topic Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create topic'
    });
  }
};

// @desc    Get all topics for user
// @route   GET /api/topics
// @access  Private
export const getTopics = async (req: Request, res: Response) => {
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
    console.error('Get Topics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics'
    });
  }
};

// @desc    Get single topic with learning paths
// @route   GET /api/topics/:id
// @access  Private
export const getTopic = async (req: Request, res: Response) => {
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

    // Get associated learning paths
    const learningPaths = await LearningPath.find({ 
      topicId: topic._id,
      userId: req.user?._id 
    });

    res.status(200).json({
      success: true,
      topic,
      learningPaths
    });
  } catch (error) {
    console.error('Get Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic'
    });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { title, description, tags } = req.body;

    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if user owns the topic
    if (topic.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this topic'
      });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { title, description, tags },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      topic: updatedTopic
    });
  } catch (error) {
    console.error('Update Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update topic'
    });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Check if user owns the topic
    if (topic.createdBy.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this topic'
      });
    }

    // Delete associated learning paths
    await LearningPath.deleteMany({ topicId: topic._id });

    // Delete the topic
    await Topic.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete Topic Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete topic'
    });
  }
};