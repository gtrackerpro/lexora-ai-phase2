import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Clock, BookOpen } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'completed' | 'started' | 'continued';
  title: string;
  topic: string;
  timestamp: string;
  duration?: string;
  progress?: number;
}

const RecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'completed',
      title: 'Introduction to Variables',
      topic: 'Python Basics',
      timestamp: '2 hours ago',
      duration: '12 min',
    },
    {
      id: '2',
      type: 'continued',
      title: 'Functions and Methods',
      topic: 'Python Basics',
      timestamp: '1 day ago',
      duration: '18 min',
      progress: 65,
    },
    {
      id: '3',
      type: 'started',
      title: 'Data Structures Overview',
      topic: 'Advanced Python',
      timestamp: '2 days ago',
      duration: '25 min',
      progress: 15,
    },
    {
      id: '4',
      type: 'completed',
      title: 'Setting Up Your Environment',
      topic: 'Python Basics',
      timestamp: '3 days ago',
      duration: '8 min',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'started':
        return <Play className="h-5 w-5 text-primary-400" />;
      case 'continued':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-dark-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'border-green-400';
      case 'started':
        return 'border-primary-400';
      case 'continued':
        return 'border-yellow-400';
      default:
        return 'border-dark-600';
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center space-x-4 p-3 rounded-lg border-l-4 bg-dark-700 ${getActivityColor(activity.type)}`}
          >
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{activity.title}</p>
              <p className="text-dark-300 text-sm">{activity.topic}</p>
              {activity.progress && (
                <div className="mt-2">
                  <div className="w-full bg-dark-600 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${activity.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-dark-400 text-sm">{activity.timestamp}</p>
              {activity.duration && (
                <p className="text-dark-500 text-xs">{activity.duration}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <button className="w-full mt-4 text-primary-400 hover:text-primary-300 text-sm font-medium">
        View All Activity
      </button>
    </div>
  );
};

export default RecentActivity;