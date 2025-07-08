import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lexora_token');
      localStorage.removeItem('lexora_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: any }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updatePreferences: async (preferences: any): Promise<{ success: boolean; user: any }> => {
    const response = await api.put('/users/me/preferences', { preferences });
    return response.data;
  },
};

// Topics API
export const topicsAPI = {
  create: async (topicData: {
    title: string;
    description: string;
    tags: string[];
    difficulty?: string;
    weeks?: number;
    goals?: string;
  }): Promise<{ success: boolean; topic: any; learningPath?: any; aiContent?: any }> => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  getAll: async (): Promise<{ success: boolean; topics: any[]; count: number }> => {
    const response = await api.get('/topics');
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; topic: any; learningPaths?: any[] }> => {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  update: async (id: string, topicData: {
    title?: string;
    description?: string;
    tags?: string[];
  }): Promise<{ success: boolean; topic: any }> => {
    const response = await api.put(`/topics/${id}`, topicData);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  },
};

// Learning Paths API
export const learningPathsAPI = {
  create: async (pathData: {
    topicId: string;
    title: string;
    description: string;
    weeks: number;
    estimatedTotalHours: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    goal: string;
  }): Promise<{ success: boolean; learningPath: any }> => {
    const response = await api.post('/learning-paths', pathData);
    return response.data;
  },

  getByTopic: async (topicId: string): Promise<{ success: boolean; learningPaths: any[]; count: number }> => {
    const response = await api.get(`/learning-paths/topic/${topicId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; learningPath: any }> => {
    const response = await api.get(`/learning-paths/${id}`);
    return response.data;
  },
};

export default api;

// Lessons API
export const lessonsAPI = {
  create: async (lessonData: {
    learningPathId: string;
    title: string;
    week: number;
    day: number;
    objectives: string[];
  }): Promise<{ success: boolean; lesson: any }> => {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  },

  getByPath: async (pathId: string): Promise<{ success: boolean; lessons: any[]; count: number }> => {
    const response = await api.get(`/lessons/path/${pathId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; lesson: any; video?: any }> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  generateVideo: async (lessonId: string, data: {
    avatarId: string;
    voiceId: string;
  }): Promise<{ success: boolean; video: any }> => {
    const response = await api.post(`/lessons/${lessonId}/generate-video`, data);
    return response.data;
  },

  update: async (id: string, lessonData: {
    title?: string;
    content?: string;
    script?: string;
    objectives?: string[];
  }): Promise<{ success: boolean; lesson: any }> => {
    const response = await api.put(`/lessons/${id}`, lessonData);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },
};

// Videos API
export const videosAPI = {
  getByLesson: async (lessonId: string): Promise<{ success: boolean; videos: any[]; count: number }> => {
    const response = await api.get(`/videos/lesson/${lessonId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; video: any }> => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: {
    status: string;
    videoUrl?: string;
    durationSec?: number;
  }): Promise<{ success: boolean; video: any }> => {
    const response = await api.put(`/videos/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  updateProgress: async (progressData: {
    lessonId: string;
    learningPathId: string;
    topicId: string;
    videoId?: string;
    watchedPercentage: number;
    completed: boolean;
    notes?: string[];
  }): Promise<{ success: boolean; progress: any }> => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },

  getUserProgress: async (filters?: {
    topicId?: string;
    learningPathId?: string;
  }): Promise<{ success: boolean; progress: any[]; stats: any; count: number }> => {
    const params = new URLSearchParams();
    if (filters?.topicId) params.append('topicId', filters.topicId);
    if (filters?.learningPathId) params.append('learningPathId', filters.learningPathId);
    
    const response = await api.get(`/progress/user?${params.toString()}`);
    return response.data;
  },

  getLessonProgress: async (lessonId: string): Promise<{ success: boolean; progress: any }> => {
    const response = await api.get(`/progress/lesson/${lessonId}`);
    return response.data;
  },

  addNote: async (progressId: string, note: string): Promise<{ success: boolean; progress: any }> => {
    const response = await api.post(`/progress/${progressId}/notes`, { note });
    return response.data;
  },

  getAnalytics: async (): Promise<{ success: boolean; analytics: any }> => {
    const response = await api.get('/progress/analytics');
    return response.data;
  },
};

// Assets API
export const assetsAPI = {
  upload: async (formData: FormData): Promise<{ success: boolean; asset: any }> => {
    const response = await api.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (type?: string): Promise<{ success: boolean; assets: any[]; count: number }> => {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/assets${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; asset: any }> => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  updateUsage: async (id: string, usedIn: string[]): Promise<{ success: boolean; asset: any }> => {
    const response = await api.put(`/assets/${id}/usage`, { usedIn });
    return response.data;
  },
};

// Search API
export const searchAPI = {
  searchAll: async (query: string, filters?: {
    type?: 'topic' | 'lesson' | 'video' | 'path';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  }): Promise<{ success: boolean; results: any[]; count: number }> => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    
    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },
  
  searchTopics: async (query: string): Promise<{ success: boolean; topics: any[]; count: number }> => {
    const response = await api.get(`/topics/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  searchLessons: async (query: string): Promise<{ success: boolean; lessons: any[]; count: number }> => {
    const response = await api.get(`/lessons/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getRecentSearches: async (): Promise<{ success: boolean; searches: string[] }> => {
    const response = await api.get('/search/recent');
    return response.data;
  },
  
  saveSearch: async (query: string): Promise<{ success: boolean }> => {
    const response = await api.post('/search/recent', { query });
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (): Promise<{ success: boolean; notifications: any[] }> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean; notification: any }> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.put('/notifications/markAllRead');
    return response.data;
  },
};
