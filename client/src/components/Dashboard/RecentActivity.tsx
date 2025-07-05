import React from 'react';
import { Clock, BookOpen, Video, CheckCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lesson_completed' | 'video_watched' | 'topic_created' | 'path_started';
  title: string;
  description: string;
  timestamp: string;
  progress?: number;
}

const RecentActivity: React.FC = () => {
  // Mock data - replace with real data from API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'lesson_completed',
      title: 'Python Basics - Variables',
      description: 'Completed lesson on Python variables and data types',
      timestamp: '2 hours ago',
      progress: 100
    },
    {
      id: '2',
      type: 'video_watched',
      title: 'Introduction to Functions',
      description: 'Watched 85% of the lesson video',
      timestamp: '5 hours ago',
      progress: 85
    },
    {
      id: '3',
      type: 'topic_created',
      title: 'Machine Learning Fundamentals',
      description: 'Created new learning topic',
      timestamp: '1 day ago'
    },
    {
      id: '4',
      type: 'path_started',
      title: 'Web Development Bootcamp',
      description: 'Started new learning path',
      timestamp: '2 days ago'
    }
  ];

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

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
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
                  <div className="w-full bg-dark-700 rounded-full h-1">
                    <div 
                      className="bg-primary-500 h-1 rounded-full"
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-dark-400">{activity.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        View all activity
      </button>
    </div>
  );
};

export default RecentActivity;