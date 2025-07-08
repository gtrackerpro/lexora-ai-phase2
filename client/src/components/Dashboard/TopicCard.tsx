import React from 'react';
import { Play, Clock, BookOpen, Star, TrendingUp, Award } from 'lucide-react';

interface TopicCardProps {
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  thumbnail?: string;
  onContinue: () => void;
  index?: number;
  topic?: any;
}

const TopicCard: React.FC<TopicCardProps> = ({
  title,
  description,
  progress,
  totalLessons,
  completedLessons,
  estimatedTime,
  difficulty,
  rating,
  thumbnail,
  onContinue,
  index = 0,
  topic,
}) => {
  const difficultyColors = {
    Beginner: 'from-success-500 to-success-600',
    Intermediate: 'from-warning-500 to-warning-600',
    Advanced: 'from-error-500 to-error-600',
  };

  const difficultyBadgeColors = {
    Beginner: 'bg-success-500/20 text-success-400 border-success-500/30',
    Intermediate: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    Advanced: 'bg-error-500/20 text-error-400 border-error-500/30',
  };

  return (
    <div className="group relative overflow-hidden">
      
      {/* Card */}
      <div className="relative bg-dark-900/80 border border-dark-800 rounded-lg p-3 sm:p-4 lg:p-6 hover:border-dark-700 transition-all duration-200 h-full">
        {/* Thumbnail */}
        <div className="relative h-32 sm:h-40 lg:h-44 bg-dark-800 rounded-lg mb-3 sm:mb-4 overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full relative">
              <img 
                src="/lexora-logo.png" 
                alt="Lexora" 
                className="h-16 w-16 object-contain opacity-60"
              />
            </div>
          )}
          
          {/* Play Button */}
          <button
            onClick={onContinue}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <div className="bg-primary-600 rounded-full p-3 text-white">
              <Play className="h-6 w-6 text-white ml-1" />
            </div>
          </button>

          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`badge ${difficultyBadgeColors[difficulty]}`}>
              {difficulty}
            </span>
          </div>

          {/* Progress Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/50 rounded-lg px-2 py-1">
              <span className="text-white text-xs font-medium">{progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white line-clamp-2">
              {title}
            </h3>
            <p className="text-dark-300 text-xs sm:text-sm mt-2 line-clamp-2">{description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Progress</span>
              <span className="text-primary-400 font-semibold">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 sm:space-x-2 text-dark-400">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-dark-400">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{estimatedTime}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? 'text-warning-400 fill-current' : 'text-dark-600'
                  }`}
                />
              ))}
              <span className="text-sm text-dark-400 ml-2">({rating}/5)</span>
            </div>
            
            {progress > 0 && (
              <div className="flex items-center space-x-1 text-primary-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">In Progress</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (topic?._id) {
                // Navigate to learning path instead of generic continue
                window.location.href = `/learning/${topic._id}`;
              } else {
                onContinue();
              }
            }}
            className="w-full btn-primary py-2 mt-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {progress > 0 ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>Continue Learning</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>Start Learning</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Achievement Badge */}
        {progress === 100 && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-warning-500 rounded-full p-2">
              <Award className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicCard;