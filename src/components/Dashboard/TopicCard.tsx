import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Star } from 'lucide-react';

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
}) => {
  const difficultyColors = {
    Beginner: 'bg-green-500',
    Intermediate: 'bg-yellow-500',
    Advanced: 'bg-red-500',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-hover group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-4 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200" />
        <button
          onClick={onContinue}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
            <Play className="h-8 w-8 text-white" />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>

        <p className="text-dark-300 text-sm line-clamp-2">{description}</p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-dark-400">Progress</span>
            <span className="text-primary-400 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-dark-400">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{completedLessons}/{totalLessons} lessons</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-dark-600'
              }`}
            />
          ))}
          <span className="text-sm text-dark-400 ml-2">({rating}/5)</span>
        </div>

        {/* Action Button */}
        <button
          onClick={onContinue}
          className="w-full btn-primary mt-4"
        >
          {progress > 0 ? 'Continue Learning' : 'Start Learning'}
        </button>
      </div>
    </motion.div>
  );
};

export default TopicCard;