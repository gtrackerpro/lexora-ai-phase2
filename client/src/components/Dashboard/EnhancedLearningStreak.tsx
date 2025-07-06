import React from 'react';
import { motion } from 'framer-motion';
import { useUserStreak } from '../../hooks/useActivity';
import { Zap, Calendar, Target, TrendingUp, Award, Flame } from 'lucide-react';
import LoadingCard from '../Common/LoadingCard';
import ErrorState from '../Common/ErrorState';

const EnhancedLearningStreak: React.FC = () => {
  const { data: streakData, isLoading, error } = useUserStreak();

  if (isLoading) {
    return <LoadingCard height="h-80" />;
  }

  if (error) {
    return (
      <div className="glass-card h-80">
        <ErrorState 
          title="Failed to load streak"
          message="We couldn't load your learning streak data."
          className="h-full"
        />
      </div>
    );
  }

  if (!streakData) return null;

  const { current, longest, weeklyGoal, weeklyProgress, streakDates, milestones } = streakData;
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '🏆';
    if (streak >= 60) return '🔥';
    if (streak >= 30) return '⚡';
    if (streak >= 14) return '✨';
    if (streak >= 7) return '💪';
    if (streak >= 3) return '🌟';
    return '🌱';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return "You're a learning legend! Incredible dedication! 🏆";
    if (streak >= 60) return "Two months strong! You're unstoppable! 🔥";
    if (streak >= 30) return "One month of dedication! Amazing! ⚡";
    if (streak >= 14) return "Two weeks strong! You're on fire! ✨";
    if (streak >= 7) return "One week strong! Keep the momentum! 💪";
    if (streak >= 3) return "Great start! You're building a habit! 🌟";
    if (streak >= 1) return "Every journey starts with a single step! 🌱";
    return "Ready to start your learning journey? 🚀";
  };

  // Generate last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toDateString(),
      hasActivity: streakDates.includes(date.toDateString()),
      isToday: date.toDateString() === new Date().toDateString()
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div className="relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-3xl"
          >
            {getStreakEmoji(current)}
          </motion.div>
        </div>

        {/* Current Streak Display */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl font-bold text-gradient mb-2"
          >
            {current}
          </motion.div>
          <p className="text-dark-300 text-lg mb-2">
            {current === 1 ? 'day' : 'days'} in a row
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary-400 text-sm font-medium"
          >
            {getStreakMessage(current)}
          </motion.p>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400 flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Weekly Goal</span>
            </span>
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
          <p className="text-xs text-dark-400 text-center">
            {Math.round(weeklyPercentage)}% of weekly goal completed
          </p>
        </div>

        {/* 7-Day Streak Visualization */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4 text-dark-400" />
            <span className="text-sm text-dark-400">Last 7 days</span>
          </div>
          <div className="flex justify-between space-x-1">
            {last7Days.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className={`flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  day.hasActivity
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-sm'
                    : 'bg-dark-800 text-dark-400'
                } ${day.isToday ? 'ring-2 ring-primary-400 ring-opacity-50' : ''}`}
                title={new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              >
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-dark-800/50 rounded-xl">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Award className="h-4 w-4 text-success-400" />
              <span className="text-xs text-dark-400">Best Streak</span>
            </div>
            <p className="text-lg font-bold text-success-400">{longest}</p>
          </div>
          <div className="text-center p-3 bg-dark-800/50 rounded-xl">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-accent-400" />
              <span className="text-xs text-dark-400">This Week</span>
            </div>
            <p className="text-lg font-bold text-accent-400">{weeklyProgress}</p>
          </div>
        </div>

        {/* Milestones */}
        {milestones.next && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="p-4 bg-gradient-to-r from-primary-600/20 to-accent-600/20 rounded-xl border border-primary-600/30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Next Milestone</span>
              <span className="text-sm text-primary-400">{milestones.next} days</span>
            </div>
            <div className="progress-bar mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestones.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 1.4 }}
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-center text-primary-300">
              {current} / {milestones.next} days ({Math.round(milestones.progress)}%)
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedLearningStreak;