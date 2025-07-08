import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Play, 
  Code, 
  Database, 
  Brain,
  Sparkles,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info,
  Award
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import SearchModal from '../components/Search/SearchModal';
import NotificationPanel from '../components/Notification/NotificationCenter';
import { ToastContainer, useToast } from '../components/Notification/Toast';
import { topicsAPI } from '../services/api';

const SearchDemo: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);
  const toast = useToast();

  // Mock notifications for demo
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'achievement' as const,
      title: '🎉 Achievement Unlocked!',
      message: 'You completed the Python Basics course!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'lesson' as const,
      title: '📚 New Lesson Available',
      message: 'Advanced React Hooks is ready for you',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'reminder' as const,
      title: '⏰ Study Reminder',
      message: 'Keep your 7-day streak going!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'info' as const,
      title: '💡 Pro Tip',
      message: 'Use the search feature to quickly find lessons',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  const handleSearchSelect = (result: any) => {
    toast.success(`Opening: ${result.title}`, `Navigate to ${result.type} page`);
    console.log('Selected search result:', result);
  };

  const handleNotificationClick = (notification: any) => {
    toast.info('Notification clicked', notification.message);
    console.log('Clicked notification:', notification);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const createTestData = async () => {
    setIsCreatingTestData(true);
    try {
      const testTopics = [
        {
          title: 'Python for Data Science',
          description: 'Learn Python programming with focus on data analysis, pandas, numpy, and machine learning basics.',
          tags: ['python', 'data science', 'pandas', 'numpy', 'machine learning'],
          difficulty: 'intermediate',
          weeks: 8
        },
        {
          title: 'React.js Complete Guide',
          description: 'Master React.js from basics to advanced concepts including hooks, context, and state management.',
          tags: ['react', 'javascript', 'frontend', 'web development'],
          difficulty: 'beginner',
          weeks: 6
        },
        {
          title: 'Machine Learning Fundamentals',
          description: 'Introduction to machine learning algorithms, supervised learning, and neural networks.',
          tags: ['machine learning', 'ai', 'algorithms', 'neural networks'],
          difficulty: 'advanced',
          weeks: 10
        },
        {
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
          tags: ['nodejs', 'backend', 'express', 'mongodb'],
          difficulty: 'intermediate',
          weeks: 7
        }
      ];

      const results = [];
      for (const topic of testTopics) {
        try {
          const result = await topicsAPI.create(topic);
          results.push(result);
          toast.success('Topic created', `Created: ${topic.title}`);
        } catch (error) {
          console.error('Error creating topic:', error);
          toast.error('Failed to create topic', `Error: ${topic.title}`);
        }
      }
      
      setTestResults(results);
      toast.success('Test data created!', `Created ${results.length} topics for testing`);
    } catch (error) {
      console.error('Error creating test data:', error);
      toast.error('Failed to create test data', 'Please check the console for details');
    } finally {
      setIsCreatingTestData(false);
    }
  };

  const testToastTypes = () => {
    toast.success('Success!', 'This is a success message');
    setTimeout(() => toast.error('Error!', 'This is an error message'), 1000);
    setTimeout(() => toast.warning('Warning!', 'This is a warning message'), 2000);
    setTimeout(() => toast.info('Info!', 'This is an info message'), 3000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-white">
              Search & Notification <span className="text-primary-400">Demo</span>
            </h1>
            <p className="text-dark-300 text-lg max-w-2xl mx-auto">
              Test and demonstrate the comprehensive search and notification system
            </p>
          </motion.div>
        </div>

        {/* Feature Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-hover p-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-600/20 rounded-xl mr-4">
                <Search className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Smart Search</h3>
            </div>
            <p className="text-dark-300 mb-4">
              Advanced search with filtering, keyboard navigation, and real-time results.
            </p>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn-primary w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Open Search
            </button>
          </motion.div>

          {/* Notification Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-hover p-6 relative"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-accent-600/20 rounded-xl mr-4 relative">
                <Bell className="w-6 h-6 text-accent-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-error-500 rounded-full border-2 border-dark-900"></span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white">Notifications</h3>
            </div>
            <p className="text-dark-300 mb-4">
              Smart notification panel with filtering and real-time updates.
            </p>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="btn-secondary w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Show Notifications {unreadCount > 0 && `(${unreadCount})`}
            </button>
            
            {/* Notification Panel */}
            {isNotificationOpen && (
              <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onNotificationClick={handleNotificationClick}
              />
            )}
          </motion.div>

          {/* Toast Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-hover p-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-success-600/20 rounded-xl mr-4">
                <Sparkles className="w-6 h-6 text-success-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Toast Messages</h3>
            </div>
            <p className="text-dark-300 mb-4">
              Beautiful toast notifications with multiple types and animations.
            </p>
            <button
              onClick={testToastTypes}
              className="btn-accent w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test All Types
            </button>
          </motion.div>
        </div>

        {/* Test Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">Test Data Management</h3>
              <p className="text-dark-300">Create sample topics to test the search functionality</p>
            </div>
            <button
              onClick={createTestData}
              disabled={isCreatingTestData}
              className="btn-primary"
            >
              {isCreatingTestData ? (
                <>
                  <div className="spinner w-4 h-4 mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Test Data
                </>
              )}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Created Topics:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResults.map((result, index) => (
                  <div key={index} className="bg-dark-800/50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-5 h-5 text-success-400 mr-2" />
                      <h5 className="font-medium text-white">{result.topic?.title}</h5>
                    </div>
                    <p className="text-sm text-dark-400 line-clamp-2">
                      {result.topic?.description}
                    </p>
                    {result.topic?.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.topic.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs bg-primary-600/20 text-primary-400 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <button
            onClick={() => toast.success('Success!', 'This is a success toast')}
            className="flex items-center justify-center p-4 bg-success-600/20 hover:bg-success-600/30 rounded-xl transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-success-400 mr-2" />
            <span className="text-success-400 font-medium">Success</span>
          </button>
          
          <button
            onClick={() => toast.error('Error!', 'This is an error toast')}
            className="flex items-center justify-center p-4 bg-error-600/20 hover:bg-error-600/30 rounded-xl transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-error-400 mr-2" />
            <span className="text-error-400 font-medium">Error</span>
          </button>
          
          <button
            onClick={() => toast.warning('Warning!', 'This is a warning toast')}
            className="flex items-center justify-center p-4 bg-warning-600/20 hover:bg-warning-600/30 rounded-xl transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-warning-400 mr-2" />
            <span className="text-warning-400 font-medium">Warning</span>
          </button>
          
          <button
            onClick={() => toast.info('Info!', 'This is an info toast')}
            className="flex items-center justify-center p-4 bg-primary-600/20 hover:bg-primary-600/30 rounded-xl transition-colors"
          >
            <Info className="w-5 h-5 text-primary-400 mr-2" />
            <span className="text-primary-400 font-medium">Info</span>
          </button>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">How to Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Search Features:</h4>
              <ul className="space-y-2 text-dark-300 text-sm">
                <li>• Click "Open Search" or use the header search bar</li>
                <li>• Try searching for "python", "react", or "machine learning"</li>
                <li>• Use arrow keys to navigate results</li>
                <li>• Press Enter to select or Escape to close</li>
                <li>• Test different filters (All, Topic, Lesson, etc.)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Notification Features:</h4>
              <ul className="space-y-2 text-dark-300 text-sm">
                <li>• Click "Show Notifications" to open the panel</li>
                <li>• Try filtering between "All" and "Unread"</li>
                <li>• Click notifications to mark them as read</li>
                <li>• Use "Mark all read" to clear all notifications</li>
                <li>• Test toast notifications with the buttons above</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSearchSelect}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </Layout>
  );
};

export default SearchDemo;
