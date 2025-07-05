export interface User {
  _id: string;
  email: string;
  display_name: string;
  avatar_id?: string;
  voice_id?: string;
  preferences: {
    gender_voice: 'male' | 'female' | 'neutral';
    learning_style: 'visual' | 'auditory' | 'kinesthetic';
  };
  created_at: string;
  last_login: string;
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  created_by: string;
  created_at: string;
}

export interface LearningPath {
  _id: string;
  topic_id: string;
  user_id: string;
  title: string;
  description: string;
  weeks: number;
  estimated_total_hours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: string;
  created_at: string;
}

export interface Lesson {
  _id: string;
  learning_path_id: string;
  topic_id: string;
  user_id: string;
  title: string;
  week: number;
  day: number;
  content: string;
  script: string;
  objectives: string[];
  status: 'draft' | 'generating' | 'finalized';
  created_at: string;
}

export interface Video {
  _id: string;
  lesson_id: string;
  user_id: string;
  video_url: string;
  audio_url: string;
  avatar_id: string;
  voice_id: string;
  duration_sec: number;
  generated_at: string;
}

export interface Progress {
  _id: string;
  user_id: string;
  lesson_id: string;
  learning_path_id: string;
  topic_id: string;
  video_id: string;
  watched_percentage: number;
  completed: boolean;
  completed_at?: string;
  notes: string[];
  revisits: Array<{
    timestamp: string;
    watched_percent: number;
  }>;
}

export interface Asset {
  _id: string;
  user_id: string;
  type: 'avatar' | 'audio' | 'video' | 'script';
  file_url: string;
  file_name: string;
  used_in: string[];
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}