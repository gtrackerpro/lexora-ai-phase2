import { Request, Response } from 'express';
import Progress from '../models/Progress';
import Lesson from '../models/Lesson';
import Topic from '../models/Topic';
import LearningPath from '../models/LearningPath';
import { IUser } from '../models/User';

// @desc    Get user activity feed
// @route   GET /api/users/me/activity
// @access  Private
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser)?._id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get recent progress entries with populated lesson data
    const recentProgress = await Progress.find({ userId })
      .populate({
        path: 'lessonId',
        select: 'title week day',
        populate: {
          path: 'learningPathId',
          select: 'title'
        }
      })
      .populate('topicId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Transform progress data into activity items
    const activities = recentProgress.map(progress => {
      const lesson = progress.lessonId as any;
      const topic = progress.topicId as any;
      const learningPath = lesson?.learningPathId as any;

      return {
        id: progress._id,
        type: progress.completed ? 'lesson_completed' : 'lesson_progress',
        title: lesson?.title || 'Lesson',
        description: progress.completed 
          ? `Completed lesson in ${learningPath?.title || topic?.title || 'course'}`
          : `Made progress on ${lesson?.title || 'lesson'} (${Math.round(progress.watchedPercentage)}%)`,
        timestamp: progress.completedAt || progress.createdAt,
        metadata: {
          lessonId: lesson?._id,
          topicId: topic?._id,
          learningPathId: learningPath?._id,
          progress: progress.watchedPercentage,
          completed: progress.completed,
          week: lesson?.week,
          day: lesson?.day
        }
      };
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
      pagination: {
        limit,
        offset,
        hasMore: activities.length === limit
      }
    });
  } catch (error) {
    console.error('Get User Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
};

// @desc    Get user learning streak
// @route   GET /api/users/me/streak
// @access  Private
export const getUserStreak = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser)?._id;

    // Get all completed lessons with dates
    const completedLessons = await Progress.find({
      userId,
      completed: true,
      completedAt: { $exists: true }
    }).sort({ completedAt: -1 });

    // Calculate streak data
    const streakData = calculateLearningStreak(completedLessons);

    // Get weekly goal progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklyProgress = await Progress.countDocuments({
      userId,
      completed: true,
      completedAt: {
        $gte: weekStart,
        $lt: weekEnd
      }
    });

    const weeklyGoal = 5; // Default weekly goal

    res.status(200).json({
      success: true,
      streak: {
        current: streakData.currentStreak,
        longest: streakData.longestStreak,
        weeklyGoal,
        weeklyProgress,
        streakDates: streakData.streakDates,
        lastActivity: completedLessons[0]?.completedAt || null,
        milestones: calculateStreakMilestones(streakData.currentStreak)
      }
    });
  } catch (error) {
    console.error('Get User Streak Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning streak'
    });
  }
};

// @desc    Get user dashboard summary
// @route   GET /api/users/me/summary
// @access  Private
export const getUserSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUser)?._id;

    // Get counts and statistics
    const [
      totalTopics,
      totalLearningPaths,
      totalLessons,
      completedLessons,
      recentActivity,
      streakData
    ] = await Promise.all([
      Topic.countDocuments({ createdBy: userId }),
      LearningPath.countDocuments({ userId }),
      Lesson.countDocuments({ userId }),
      Progress.countDocuments({ userId, completed: true }),
      Progress.find({ userId })
        .populate('lessonId', 'title')
        .sort({ createdAt: -1 })
        .limit(5),
      Progress.find({ userId, completed: true, completedAt: { $exists: true } })
        .sort({ completedAt: -1 })
    ]);

    const streak = calculateLearningStreak(streakData);

    res.status(200).json({
      success: true,
      summary: {
        stats: {
          totalTopics,
          totalLearningPaths,
          totalLessons,
          completedLessons,
          completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          totalHours: Math.round(completedLessons * 0.25), // Estimate 15 min per lesson
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak
        },
        recentActivity: recentActivity.slice(0, 3).map(progress => ({
          id: progress._id,
          type: progress.completed ? 'completed' : 'in_progress',
          title: (progress.lessonId as any)?.title || 'Lesson',
          timestamp: progress.completedAt || progress.createdAt,
          progress: progress.watchedPercentage
        }))
      }
    });
  } catch (error) {
    console.error('Get User Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user summary'
    });
  }
};

// Helper function to calculate learning streak
function calculateLearningStreak(completedLessons: any[]) {
  if (completedLessons.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDates: [] };
  }

  // Get unique completion dates
  const completionDates = completedLessons
    .map(lesson => lesson.completedAt.toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  // Calculate current streak
  if (completionDates.includes(today) || completionDates.includes(yesterday)) {
    let checkDate = new Date();
    if (!completionDates.includes(today)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (completionDates.includes(checkDate.toDateString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak
  for (let i = 0; i < completionDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(completionDates[i]);
      const previousDate = new Date(completionDates[i - 1]);
      const dayDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    streakDates: completionDates.slice(0, 7) // Last 7 days for visualization
  };
}

// Helper function to calculate streak milestones
function calculateStreakMilestones(currentStreak: number) {
  const milestones = [3, 7, 14, 30, 60, 100];
  const achieved = milestones.filter(milestone => currentStreak >= milestone);
  const next = milestones.find(milestone => currentStreak < milestone);

  return {
    achieved,
    next,
    progress: next ? (currentStreak / next) * 100 : 100
  };
}