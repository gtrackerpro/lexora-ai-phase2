import { Response } from 'express';
import Progress from '../models/Progress';
import Lesson from '../models/Lesson';
import Video from '../models/Video';

// @desc    Create or update progress
// @route   POST /api/progress
// @access  Private
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { 
      lessonId, 
      learningPathId, 
      topicId, 
      videoId, 
      watchedPercentage, 
      completed, 
      notes 
    } = req.body;

    // Verify lesson exists and belongs to user
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Find existing progress or create new
    let progress = await Progress.findOne({
      userId: req.user?._id,
      lessonId
    });

    if (progress) {
      // Update existing progress
      progress.watchedPercentage = watchedPercentage;
      progress.completed = completed;
      if (notes) progress.notes = notes;
      if (completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }
      
      // Add revisit entry
      progress.revisits.push({
        timestamp: new Date(),
        watchedPercent: watchedPercentage
      });

      await progress.save();
    } else {
      // Create new progress
      progress = await Progress.create({
        userId: req.user?._id,
        lessonId,
        learningPathId,
        topicId,
        videoId,
        watchedPercentage,
        completed,
        completedAt: completed ? new Date() : undefined,
        notes: notes || [],
        revisits: [{
          timestamp: new Date(),
          watchedPercent: watchedPercentage
        }]
      });
    }

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Update Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
};

// @desc    Get user's progress
// @route   GET /api/users/me/progress
// @access  Private
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const { topicId, learningPathId } = req.query;

    const filter: any = { userId: req.user?._id };
    if (topicId) filter.topicId = topicId;
    if (learningPathId) filter.learningPathId = learningPathId;

    const progress = await Progress.find(filter)
      .populate('lessonId', 'title week day')
      .populate('learningPathId', 'title')
      .populate('topicId', 'title')
      .sort({ createdAt: -1 });

    // Calculate overall statistics
    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.completed).length;
    const totalWatchTime = progress.reduce((sum, p) => {
      return sum + (p.watchedPercentage / 100) * 10; // Assuming 10 min average per lesson
    }, 0);

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
      stats: {
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        totalWatchTime: Math.round(totalWatchTime)
      }
    });
  } catch (error) {
    console.error('Get User Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
};

// @desc    Get progress for specific lesson
// @route   GET /api/lessons/:lessonId/progress
// @access  Private
export const getLessonProgress = async (req: Request, res: Response) => {
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

    const progress = await Progress.findOne({
      userId: req.user?._id,
      lessonId
    }).populate('lessonId videoId');

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get Lesson Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson progress'
    });
  }
};

// @desc    Add note to progress
// @route   POST /api/progress/:id/notes
// @access  Private
export const addProgressNote = async (req: Request, res: Response) => {
  try {
    const { note } = req.body;
    const progressId = req.params.id;

    const progress = await Progress.findById(progressId);
    if (!progress || progress.userId.toString() !== req.user?._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    progress.notes.push(note);
    await progress.save();

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Add Progress Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
};

// @desc    Get learning analytics
// @route   GET /api/users/me/analytics
// @access  Private
export const getLearningAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    // Get all progress for user
    const allProgress = await Progress.find({ userId })
      .populate('lessonId', 'title week day')
      .populate('learningPathId', 'title')
      .populate('topicId', 'title');

    // Calculate streak
    const completedDates = allProgress
      .filter(p => p.completed && p.completedAt)
      .map(p => p.completedAt!.toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort();

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Calculate current streak
    if (completedDates.includes(today) || completedDates.includes(yesterday)) {
      let checkDate = new Date();
      while (completedDates.includes(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate max streak
    for (let i = 0; i < completedDates.length; i++) {
      if (i === 0 || 
          new Date(completedDates[i]).getTime() - new Date(completedDates[i-1]).getTime() === 24 * 60 * 60 * 1000) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    // Weekly progress
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayProgress = allProgress.filter(p => 
        p.completedAt && p.completedAt.toDateString() === dateStr
      ).length;
      weeklyProgress.push({
        date: dateStr,
        completed: dayProgress
      });
    }

    // Topic progress
    const topicStats = {};
    allProgress.forEach(p => {
      const topicTitle = p.topicId?.title || 'Unknown';
      if (!topicStats[topicTitle]) {
        topicStats[topicTitle] = { total: 0, completed: 0 };
      }
      topicStats[topicTitle].total++;
      if (p.completed) topicStats[topicTitle].completed++;
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalLessons: allProgress.length,
        completedLessons: allProgress.filter(p => p.completed).length,
        currentStreak,
        maxStreak,
        weeklyProgress,
        topicStats,
        averageWatchPercentage: allProgress.length > 0 
          ? allProgress.reduce((sum, p) => sum + p.watchedPercentage, 0) / allProgress.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Get Learning Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};