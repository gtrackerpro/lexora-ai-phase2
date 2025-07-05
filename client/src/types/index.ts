export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  avatarId?: string;
  voiceId?: string;
  preferences: {
    genderVoice: 'male' | 'female' | 'neutral';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  };
  createdAt: string;
  lastLogin?: string;
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export interface LearningPath {
  _id: string;
  topicId: string;
  userId: string;
  title: string;
  description: string;
  weeks: number;
  estimatedTotalHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  createdAt: string;
}

export interface Lesson {
  _id: string;
  learningPathId: string;
  topicId: string;
  userId: string;
  title: string;
  week: number;
  day: number;
  content: string;
  script: string;
  objectives: string[];
  status: 'draft' | 'generating' | 'finalized';
  createdAt: string;
}

export interface Video {
  _id: string;
  lessonId: string;
  userId: string;
  videoUrl: string;
  audioUrl: string;
  avatarId: string;
  voiceId: string;
  durationSec: number;
  generatedAt: string;
}

export interface Progress {
  _id: string;
  userId: string;
  lessonId: string;
  learningPathId: string;
  topicId: string;
  videoId?: string;
  watchedPercentage: number;
  completed: boolean;
  completedAt?: string;
  notes: string[];
  revisits: Array<{
    timestamp: string;
    watchedPercent: number;
  }>;
  createdAt: string;
}

export interface Asset {
  _id: string;
  userId: string;
  type: 'avatar' | 'audio' | 'video' | 'script';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  usedIn: string[];
  createdAt: string;
}

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