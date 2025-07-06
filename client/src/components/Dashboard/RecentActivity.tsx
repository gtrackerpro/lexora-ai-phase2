import React from 'react';
import { motion } from 'framer-motion';
import { useUserProgress } from '../../hooks/useProgress';
import { Clock, BookOpen, Video, CheckCircle } from 'lucide-react';
import LoadingCard from '../Common/LoadingCard';
import ErrorState from '../Common/ErrorState';

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'video_watched' | 'topic_created' | 'path_started';
  title: string;
  description: string;
  timestamp: string;
  progress?: number;
}

const RecentActivity: React.FC = () => {
  const { data: progressData, isLoading, error } = useUserProgress();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'video_watched':
        return <Video className="w-4 h-4 text-primary-400" />;
      case 'topic_created':
        return <BookOpen className="w-4 h-4 text-secondary-400" />;
      case 'path_started':
        return <BookOpen className="w-4 h-4 text-accent-400" />;
      default:
        return <Clock className="w-4 h-4 text-dark-400" />;
    }
  };

  // Transform progress data to activity items
  const transformProgressToActivities = (progressData: any): ActivityItem[] => {
    if (!progressData?.progress) return [];
    
    return progressData.progress
      .filter((item: any) => item.completedAt || item.watchedPercentage > 0)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((item: any, index: number): ActivityItem => ({
        id: item._id,
        type: item.completed ? 'lesson_completed' : 'video_watched',
        title: item.lessonId?.title || 'Lesson',
        description: item.completed 
          ? 'Completed lesson successfully'
          : `Watched ${Math.round(item.watchedPercentage)}% of the lesson`,
        timestamp: formatTimestamp(item.completedAt || item.createdAt),
        progress: item.completed ? 100 : item.watchedPercentage
      }));
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return <LoadingCard height="h-80" />;
  }

  if (error) {
    return (
      <div className="glass-card h-80">
        <ErrorState 
          title="Failed to load activity"
          message="We couldn't load your recent activity."
          className="h-full"
        />
      </div>
    );
  }

  const activities = transformProgressToActivities(progressData);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div 
              key={activity.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-dark-800/50 transition-colors"
            >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {activity.title}
              </p>
              <p className="text-xs text-dark-400 mt-1">
                {activity.description}
              </p>
              {activity.progress && (
                <div className="mt-2">
                  <div className="w-full bg-dark-800 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-dark-400">{activity.timestamp}</span>
            </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 mb-2">No recent activity</p>
          <p className="text-dark-500 text-sm">Start learning to see your activity here</p>
        </div>
      )}

      {activities.length > 0 && (
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-6 text-sm text-primary-400 hover:text-primary-300 transition-colors py-2 rounded-lg hover:bg-dark-800/30"
        >
          View all activity
        </motion.button>
      )}
    </motion.div>
  );
};

export default RecentActivity;