import React from 'react';
import { motion } from 'framer-motion';
import { useUserActivity } from '../../hooks/useActivity';
import { Clock, BookOpen, Video, CheckCircle, Play, TrendingUp } from 'lucide-react';
import LoadingCard from '../Common/LoadingCard';
import ErrorState from '../Common/ErrorState';

const EnhancedRecentActivity: React.FC = () => {
  const { data: activities, isLoading, error } = useUserActivity(8);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="w-4 h-4 text-success-400" />;
      case 'lesson_progress':
        return <Play className="w-4 h-4 text-primary-400" />;
      case 'topic_created':
        return <BookOpen className="w-4 h-4 text-accent-400" />;
      case 'path_started':
        return <TrendingUp className="w-4 h-4 text-warning-400" />;
      default:
        return <Clock className="w-4 h-4 text-dark-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return 'border-l-success-500 bg-success-500/5';
      case 'lesson_progress':
        return 'border-l-primary-500 bg-primary-500/5';
      case 'topic_created':
        return 'border-l-accent-500 bg-accent-500/5';
      case 'path_started':
        return 'border-l-warning-500 bg-warning-500/5';
      default:
        return 'border-l-dark-600 bg-dark-800/20';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingCard height="h-96" className="w-full" />;
  }

  if (error) {
    return (
      <div className="glass-card h-96">
        <ErrorState 
          title="Failed to load activity"
          message="We couldn't load your recent activity."
          className="h-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <div className="flex items-center space-x-2 text-sm text-dark-400">
          <Clock className="w-4 h-4" />
          <span>Last 7 days</span>
        </div>
      </div>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => (
            <motion.div 
              key={activity.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border-l-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-dark-300 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  {/* Progress indicator for in-progress lessons */}
                  {activity.metadata?.progress && !activity.metadata.completed && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-dark-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(activity.metadata.progress)}%</span>
                      </div>
                      <div className="w-full bg-dark-800 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${activity.metadata.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Week/Day indicator for lessons */}
                  {activity.metadata?.week && activity.metadata?.day && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-dark-800 text-dark-300">
                        Week {activity.metadata.week}, Day {activity.metadata.day}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-dark-400">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Clock className="h-16 w-16 text-dark-600 mx-auto mb-4" />
          </motion.div>
          <h4 className="text-lg font-medium text-white mb-2">No recent activity</h4>
          <p className="text-dark-400 mb-6">Start learning to see your activity here</p>
          <button className="btn-primary px-6 py-3">
            Start Learning
          </button>
        </div>
      )}

      {activities && activities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-dark-800"
        >
          <button className="w-full text-sm text-primary-400 hover:text-primary-300 transition-colors py-2 rounded-lg hover:bg-dark-800/30 flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>View detailed analytics</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedRecentActivity;