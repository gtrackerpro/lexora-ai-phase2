import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Award,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { learningPathsAPI, lessonsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Lesson {
  _id: string;
  title: string;
  week: number;
  day: number;
  content: string;
  objectives: string[];
  status: string;
  createdAt: string;
}

interface LearningPath {
  _id: string;
  title: string;
  description: string;
  weeks: number;
  estimatedTotalHours: number;
  difficulty: string;
  goal: string;
}

const LearningPath: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [pathResponse, lessonsResponse] = await Promise.all([
          learningPathsAPI.getById(id),
          lessonsAPI.getByPath(id)
        ]);

        if (pathResponse.success) {
          setLearningPath(pathResponse.learningPath);
        }

        if (lessonsResponse.success) {
          setLessons(lessonsResponse.lessons);
        }
      } catch (error) {
        console.error('Failed to fetch learning path:', error);
        toast.error('Failed to load learning path');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.week]) {
      acc[lesson.week] = [];
    }
    acc[lesson.week].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Learning Path Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{learningPath.title}</h1>
          <p className="text-dark-400 mt-2">{learningPath.description}</p>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Progress</p>
              <p className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-success-500 to-success-600 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Completed</p>
              <p className="text-2xl font-bold text-white">{completedLessons}/{lessons.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Duration</p>
              <p className="text-2xl font-bold text-white">{learningPath.weeks} weeks</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Difficulty</p>
              <p className="text-2xl font-bold text-white">{learningPath.difficulty}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Week Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Learning Schedule</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-400" />
            <span className="text-sm text-dark-400">{learningPath.weeks} weeks total</span>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {Array.from({ length: learningPath.weeks }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => setActiveWeek(week)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeWeek === week
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              Week {week}
            </button>
          ))}
        </div>

        {/* Lessons for Active Week */}
        <div className="space-y-4">
          {groupedLessons[activeWeek]?.map((lesson, index) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLessonClick(lesson._id)}
              className="flex items-center space-x-4 p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-xl cursor-pointer transition-all duration-200 group"
            >
              <div className="flex-shrink-0">
                {lesson.status === 'completed' ? (
                  <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-dark-700 group-hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                  Day {lesson.day}: {lesson.title}
                </h3>
                <p className="text-sm text-dark-400 mt-1">
                  {lesson.objectives.slice(0, 2).join(', ')}
                  {lesson.objectives.length > 2 && '...'}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-dark-400">
                <BookOpen className="h-4 w-4" />
                <span>~15 min</span>
              </div>
            </motion.div>
          )) || (
            <div className="text-center py-8">
              <p className="text-dark-400">No lessons available for Week {activeWeek}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Learning Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-primary-400" />
          <h2 className="text-xl font-bold text-white">Learning Goals</h2>
        </div>
        <p className="text-dark-300 leading-relaxed">{learningPath.goal}</p>
      </motion.div>
    </div>
  );
};

export default LearningPath;