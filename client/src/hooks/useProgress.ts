import { useState, useEffect } from 'react';
import { progressAPI } from '../services/api';

interface LoadingState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: Array<{ date: string; completed: number }>;
  topicProgress: Array<{ topic: string; progress: number; total: number }>;
  learningVelocity: number;
  averageScore: number;
  totalHours: number;
}

export const useProgressAnalytics = () => {
  const [state, setState] = useState<LoadingState<ProgressStats>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const response = await progressAPI.getAnalytics();
        
        if (response.success) {
          // Transform backend data to match frontend expectations
          const transformedData: ProgressStats = {
            totalLessons: response.analytics.totalLessons || 0,
            completedLessons: response.analytics.completedLessons || 0,
            currentStreak: response.analytics.currentStreak || 0,
            longestStreak: response.analytics.maxStreak || 0,
            weeklyProgress: response.analytics.weeklyProgress || [],
            topicProgress: Object.entries(response.analytics.topicStats || {}).map(([topic, stats]: [string, any]) => ({
              topic,
              progress: stats.completed,
              total: stats.total
            })),
            learningVelocity: response.analytics.weeklyProgress?.length > 0 
              ? response.analytics.weeklyProgress.reduce((sum: number, week: any) => sum + week.completed, 0) / response.analytics.weeklyProgress.length
              : 0,
            averageScore: response.analytics.averageWatchPercentage || 0,
            totalHours: Math.round((response.analytics.completedLessons || 0) * 0.25) // Estimate 15 min per lesson
          };

          setState({ 
            isLoading: false, 
            error: null, 
            data: transformedData 
          });
        } else {
          throw new Error('Failed to fetch analytics');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.message || 'Failed to load progress analytics', 
          data: null 
        });
      }
    };
    
    fetchAnalytics();
  }, []);

  return state;
};

export const useUserProgress = (filters?: { topicId?: string; learningPathId?: string }) => {
  const [state, setState] = useState<LoadingState<any>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const response = await progressAPI.getUserProgress(filters);
        
        if (response.success) {
          setState({ 
            isLoading: false, 
            error: null, 
            data: {
              progress: response.progress,
              stats: response.stats
            }
          });
        } else {
          throw new Error('Failed to fetch user progress');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.message || 'Failed to load user progress', 
          data: null 
        });
      }
    };
    
    fetchProgress();
  }, [filters?.topicId, filters?.learningPathId]);

  return state;
};