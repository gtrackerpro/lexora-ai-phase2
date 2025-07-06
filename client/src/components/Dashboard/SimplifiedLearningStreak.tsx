import React from 'react';
import { Zap, Calendar, Award } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  streakDates: string[];
}

interface SimplifiedLearningStreakProps {
  streakData: StreakData;
}

const SimplifiedLearningStreak: React.FC<SimplifiedLearningStreakProps> = ({ streakData }) => {
  const { currentStreak, longestStreak, weeklyGoal, weeklyProgress, streakDates } = streakData;
  
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  return (
    <div className="bg-dark-900/80 border border-dark-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Learning Streak</h3>
        </div>
        <div className="text-2xl">
          {currentStreak >= 30 ? '🔥' : currentStreak >= 14 ? '⚡' : currentStreak >= 7 ? '✨' : '🌱'}
        </div>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-primary-400 mb-1">
          {currentStreak}
        </div>
        <p className="text-dark-300 text-sm">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-400">Weekly Goal</span>
          <span className="text-sm font-semibold text-primary-400">
            {weeklyProgress}/{weeklyGoal} lessons
          </span>
        </div>
        <div className="w-full bg-dark-800 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full"
            style={{ width: `${Math.min(100, weeklyPercentage)}%` }}
          />
        </div>
      </div>

      {/* 7-Day Streak Visualization */}
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          <Calendar className="h-4 w-4 text-dark-400" />
          <span className="text-sm text-dark-400">Last 7 days</span>
        </div>
        <div className="flex justify-between space-x-1">
          {last7Days.map((date, index) => {
            const hasActivity = streakDates.includes(date);
            const isToday = date === today.toDateString();
            
            return (
              <div
                key={date}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  hasActivity
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-400'
                } ${isToday ? 'ring-1 ring-primary-400' : ''}`}
                title={new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              >
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center bg-dark-800 rounded-lg p-2">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Award className="h-4 w-4 text-success-400" />
            <span className="text-xs text-dark-400">Best Streak</span>
          </div>
          <p className="text-lg font-bold text-success-400">{longestStreak}</p>
        </div>
        <div className="text-center bg-dark-800 rounded-lg p-2">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Calendar className="h-4 w-4 text-accent-400" />
            <span className="text-xs text-dark-400">This Week</span>
          </div>
          <p className="text-lg font-bold text-accent-400">{weeklyProgress}</p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedLearningStreak;