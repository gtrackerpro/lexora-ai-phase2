import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calendar, Target, TrendingUp } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakDates: string[];
}

interface LearningStreakWidgetProps {
  streakData: StreakData;
}

const LearningStreakWidget: React.FC<LearningStreakWidgetProps> = ({ streakData }) => {
  const { currentStreak, longestStreak, weeklyGoal, weeklyProgress, streakDates } = streakData;
  
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '✨';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-2xl"
        >
          {getStreakEmoji(currentStreak)}
        </motion.div>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-5xl font-bold text-gradient mb-2"
        >
          {currentStreak}
        </motion.div>
        <p className="text-dark-300 text-lg">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
        {currentStreak > 0 && (
          <p className="text-primary-400 text-sm mt-1">
            Keep it up! You're on fire! 🔥
          </p>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-400">Weekly Goal</span>
          <span className="text-sm font-semibold text-primary-400">
            {weeklyProgress}/{weeklyGoal} lessons
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, weeklyPercentage)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            className="progress-fill"
          />
        </div>
        <p className="text-xs text-dark-400 mt-1 text-center">
          {Math.round(weeklyPercentage)}% complete
        </p>
      </div>

      {/* 7-Day Streak Visualization */}
      <div className="mb-6">
        <div className="flex items-center space-x-1 mb-2">
          <Calendar className="h-4 w-4 text-dark-400" />
          <span className="text-sm text-dark-400">Last 7 days</span>
        </div>
        <div className="flex justify-between space-x-1">
          {last7Days.map((date, index) => {
            const hasActivity = streakDates.includes(date);
            const isToday = date === today.toDateString();
            
            return (
              <motion.div
                key={date}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  hasActivity
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-sm'
                    : 'bg-dark-800 text-dark-400'
                } ${isToday ? 'ring-2 ring-primary-400 ring-opacity-50' : ''}`}
                title={new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              >
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Target className="h-4 w-4 text-success-400" />
            <span className="text-xs text-dark-400">Best Streak</span>
          </div>
          <p className="text-lg font-bold text-success-400">{longestStreak}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="h-4 w-4 text-accent-400" />
            <span className="text-xs text-dark-400">This Week</span>
          </div>
          <p className="text-lg font-bold text-accent-400">{weeklyProgress}</p>
        </div>
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-4 p-3 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-lg border border-primary-600/30"
      >
        <p className="text-center text-sm text-primary-300">
          {currentStreak === 0 && "Start your learning journey today! 🚀"}
          {currentStreak >= 1 && currentStreak < 3 && "Great start! Keep the momentum going! 💪"}
          {currentStreak >= 3 && currentStreak < 7 && "You're building a great habit! ✨"}
          {currentStreak >= 7 && currentStreak < 14 && "One week strong! You're unstoppable! ⚡"}
          {currentStreak >= 14 && currentStreak < 30 && "Two weeks of dedication! Amazing! 🔥"}
          {currentStreak >= 30 && "You're a learning legend! Incredible dedication! 🏆"}
        </p>
      </motion.div>
    </div>
  );
};

export default LearningStreakWidget;