import axios from 'axios';
import { AuthResponse, User, Topic, LearningPath } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updatePreferences: async (preferences: User['preferences']): Promise<{ success: boolean; user: User }> => {
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
  }): Promise<{ success: boolean; topic: Topic }> => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  getAll: async (): Promise<{ success: boolean; topics: Topic[]; count: number }> => {
    const response = await api.get('/topics');
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; topic: Topic }> => {
    const response = await api.get(`/topics/${id}`);
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
  }): Promise<{ success: boolean; learningPath: LearningPath }> => {
    const response = await api.post('/learning-paths', pathData);
    return response.data;
  },

  getByTopic: async (topicId: string): Promise<{ success: boolean; learningPaths: LearningPath[]; count: number }> => {
    const response = await api.get(`/learning-paths/topic/${topicId}`);
    return response.data;
  },

  getById: async (id: string): Promise<{ success: boolean; learningPath: LearningPath }> => {
    const response = await api.get(`/learning-paths/${id}`);
    return response.data;
  },
};

export default api;