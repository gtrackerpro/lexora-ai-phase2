import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="group relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"></div>
      
      {/* Card */}
      <div className="relative glass-card hover:border-dark-600 transition-all duration-300 h-full">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl mb-6 overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/30 to-accent-600/30"></div>
              <BookOpen className="h-16 w-16 text-white/60 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Play Button */}
          <motion.button
            initial={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onContinue}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30 hover:bg-white/30 transition-all duration-200">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </motion.button>

          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`badge ${difficultyBadgeColors[difficulty]} backdrop-blur-sm`}>
              {difficulty}
            </span>
          </div>

          {/* Progress Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
              <span className="text-white text-xs font-medium">{progress}% Complete</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-gradient transition-all duration-300 line-clamp-2">
              {title}
            </h3>
            <p className="text-dark-300 text-sm mt-2 line-clamp-2">{description}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Progress</span>
              <span className="text-primary-400 font-semibold">{progress}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: 'easeOut' }}
                className="progress-fill"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-dark-400">
              <BookOpen className="h-4 w-4" />
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
            <div className="flex items-center space-x-2 text-dark-400">
              <Clock className="h-4 w-4" />
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full btn-primary py-3 mt-6 group/btn relative overflow-hidden"
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
          </motion.button>
        </div>

        {/* Achievement Badge */}
        {progress === 100 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-gradient-to-r from-warning-500 to-warning-600 rounded-full p-2 shadow-glow">
              <Award className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TopicCard;