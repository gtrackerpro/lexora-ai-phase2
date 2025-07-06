import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Calendar,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  averageScore: number;
  weeklyProgress: Array<{ date: string; completed: number }>;
  topicProgress: Array<{ topic: string; progress: number; total: number }>;
  learningVelocity: number;
  streakData: {
    current: number;
    longest: number;
  };
}

interface ProgressAnalyticsProps {
  data: AnalyticsData;
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ data }) => {
  const {
    totalLessons,
    completedLessons,
    totalHours,
    averageScore,
    weeklyProgress,
    topicProgress,
    learningVelocity,
    streakData
  } = data;

  const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const maxWeeklyLessons = Math.max(...weeklyProgress.map(w => w.completed), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Learning Analytics</h2>
          <p className="text-dark-400">Track your progress and insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-success-500 to-success-600 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{Math.round(completionRate)}%</p>
              <p className="text-xs text-success-400">
                {completedLessons} of {totalLessons} lessons
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Learning Time</p>
              <p className="text-2xl font-bold text-white">{totalHours}h</p>
              <p className="text-xs text-blue-400">
                ~{Math.round(totalHours / 7)} hours/week
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-warning-500 to-warning-600 rounded-xl">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Average Score</p>
              <p className="text-2xl font-bold text-white">{averageScore}%</p>
              <p className="text-xs text-warning-400">
                {averageScore >= 90 ? 'Excellent!' : averageScore >= 80 ? 'Great!' : 'Keep going!'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Current Streak</p>
              <p className="text-2xl font-bold text-white">{streakData.current}</p>
              <p className="text-xs text-purple-400">
                Best: {streakData.longest} days
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
        </div>
        
        <div className="space-y-4">
          {weeklyProgress.map((week, index) => (
            <div key={week.date} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-300">
                  {new Date(week.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-primary-400 font-semibold">
                  {week.completed} lessons
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(week.completed / maxWeeklyLessons) * 100}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Topic Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="h-5 w-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-white">Topic Progress</h3>
        </div>
        
        <div className="space-y-4">
          {topicProgress.map((topic, index) => {
            const progress = (topic.progress / topic.total) * 100;
            return (
              <div key={topic.topic} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{topic.topic}</span>
                  <span className="text-accent-400">
                    {topic.progress}/{topic.total} ({Math.round(progress)}%)
                  </span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-2 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Velocity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-success-400" />
          <h3 className="text-lg font-semibold text-white">Learning Velocity</h3>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-gradient mb-2">
            {learningVelocity.toFixed(1)}
          </div>
          <p className="text-dark-300 mb-4">lessons per week</p>
          
          <div className="flex justify-center space-x-4 text-sm">
            <div className="text-center">
              <p className="text-success-400 font-semibold">
                {learningVelocity >= 5 ? 'Excellent' : learningVelocity >= 3 ? 'Good' : 'Steady'}
              </p>
              <p className="text-dark-400">Pace</p>
            </div>
            <div className="text-center">
              <p className="text-primary-400 font-semibold">
                {Math.round(52 / learningVelocity)} weeks
              </p>
              <p className="text-dark-400">To 52 lessons</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressAnalytics;