import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Check, 
  AlertTriangle, 
  Info, 
  Archive, 
  MoreVertical,
  Clock,
  User,
  Award,
  BookOpen,
  TrendingUp
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'reminder' | 'lesson';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: NotificationItem) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.read
  );
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <X className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      case 'lesson':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'info':
        return 'text-primary-400 bg-primary-600/20';
      case 'success':
        return 'text-success-400 bg-success-600/20';
      case 'warning':
        return 'text-warning-400 bg-warning-600/20';
      case 'error':
        return 'text-error-400 bg-error-600/20';
      case 'achievement':
        return 'text-accent-400 bg-accent-600/20';
      case 'reminder':
        return 'text-warning-400 bg-warning-600/20';
      case 'lesson':
        return 'text-primary-400 bg-primary-600/20';
      default:
        return 'text-dark-400 bg-dark-700/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-96 bg-dark-900/95 backdrop-blur-xl border border-dark-700 rounded-2xl shadow-dark-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-primary-600/20 text-primary-400 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 p-4 border-b border-dark-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              filter === 'unread'
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-dark-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
              <p className="text-sm mt-1">
                {filter === 'unread' ? 'All caught up!' : 'You\'ll see notifications here'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start p-3 rounded-xl mb-2 cursor-pointer transition-all group hover:bg-dark-800/50 ${
                    !notification.read ? 'bg-primary-600/5 border border-primary-600/20' : ''
                  }`}
                  onClick={() => {
                    onNotificationClick(notification);
                    if (!notification.read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  {/* Avatar or Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                    {notification.avatar ? (
                      <img 
                        src={notification.avatar} 
                        alt="Avatar" 
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      getTypeIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        <p className="text-dark-400 text-sm line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-dark-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 text-dark-400 hover:text-white transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-800 bg-dark-900/50">
          <button className="flex items-center space-x-2 text-sm text-dark-400 hover:text-white transition-colors">
            <Archive className="w-4 h-4" />
            <span>View all</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-dark-400 hover:text-white transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPanel;

