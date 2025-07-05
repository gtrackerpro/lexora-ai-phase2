import axios from 'axios';

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
  user: any;
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