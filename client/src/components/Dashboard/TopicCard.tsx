import React from 'react';
import { BookOpen, Clock, Target, ChevronRight } from 'lucide-react';
import { Topic } from '../../types';

interface TopicCardProps {
  topic: Topic;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  onClick?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  onClick
}) => {
  return (
    <div 
      className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-dark-600 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
            {topic.title}
          </h3>
          <p className="text-dark-400 text-sm line-clamp-2">
            {topic.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-400 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {topic.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs rounded-full border border-primary-500/20"
          >
            {tag}
          </span>
        ))}
        {topic.tags.length > 3 && (
          <span className="px-2 py-1 bg-dark-800 text-dark-400 text-xs rounded-full">
            +{topic.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-dark-400">
              <BookOpen className="w-4 h-4" />
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
            <div className="flex items-center space-x-1 text-dark-400">
              <Target className="w-4 h-4" />
              <span>{progress}% complete</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-dark-700 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;