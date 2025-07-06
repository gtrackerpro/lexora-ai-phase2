import { useState, useEffect } from 'react';
import axios from 'axios';

interface LoadingState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'lesson_progress' | 'topic_created' | 'path_started';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    lessonId?: string;
    topicId?: string;
    learningPathId?: string;
    progress?: number;
    completed?: boolean;
    week?: number;
    day?: number;
  };
}

interface ActivityResponse {
  success: boolean;
  count: number;
  activities: ActivityItem[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const useUserActivity = (limit: number = 10) => {
  const [state, setState] = useState<LoadingState<ActivityItem[]>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await axios.get<ActivityResponse>(`/api/users/me/activity?limit=${limit}`);
        
        if (response.data.success) {
          setState({ 
            isLoading: false, 
            error: null, 
            data: response.data.activities 
          });
        } else {
          throw new Error('Failed to fetch activity');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.response?.data?.message || 'Failed to load activity', 
          data: null 
        });
      }
    };
    
    fetchActivity();
  }, [limit]);

  return state;
};

interface StreakData {
  current: number;
  longest: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakDates: string[];
  lastActivity: string | null;
  milestones: {
    achieved: number[];
    next: number | undefined;
    progress: number;
  };
}

export const useUserStreak = () => {
  const [state, setState] = useState<LoadingState<StreakData>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await axios.get('/api/users/me/streak');
        
        if (response.data.success) {
          setState({ 
            isLoading: false, 
            error: null, 
            data: response.data.streak 
          });
        } else {
          throw new Error('Failed to fetch streak data');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.response?.data?.message || 'Failed to load streak data', 
          data: null 
        });
      }
    };
    
    fetchStreak();
  }, []);

  return state;
};

interface UserSummary {
  stats: {
    totalTopics: number;
    totalLearningPaths: number;
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'completed' | 'in_progress';
    title: string;
    timestamp: string;
    progress: number;
  }>;
}

export const useUserSummary = () => {
  const [state, setState] = useState<LoadingState<UserSummary>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const response = await axios.get('/api/users/me/summary');
        
        if (response.data.success) {
          setState({ 
            isLoading: false, 
            error: null, 
            data: response.data.summary 
          });
        } else {
          throw new Error('Failed to fetch user summary');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.response?.data?.message || 'Failed to load user summary', 
          data: null 
        });
      }
    };
    
    fetchSummary();
  }, []);

  return state;
};