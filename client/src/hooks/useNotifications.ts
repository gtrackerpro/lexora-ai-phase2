import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';

interface Notification {
  _id: string;
  type: 'achievement' | 'lesson' | 'reminder' | 'info' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoadingState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<LoadingState<Notification[]>>({
    isLoading: true,
    error: null,
    data: null
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await notificationsAPI.getAll();
      
      if (response.success) {
        setState({
          isLoading: false,
          error: null,
          data: response.notifications
        });
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message || 'Failed to load notifications',
        data: null
      });
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationsAPI.markAsRead(id);
      if (response.success && state.data) {
        // Update the local state optimistically
        setState(prev => ({
          ...prev,
          data: prev.data?.map(notif => 
            notif._id === id 
              ? { ...notif, read: true, readAt: new Date().toISOString() }
              : notif
          ) || null
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optionally refetch to ensure consistency
      fetchNotifications();
    }
  }, [state.data, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsAPI.markAllAsRead();
      if (response.success && state.data) {
        // Update all notifications to read
        setState(prev => ({
          ...prev,
          data: prev.data?.map(notif => ({
            ...notif,
            read: true,
            readAt: new Date().toISOString()
          })) || null
        }));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Optionally refetch to ensure consistency
      fetchNotifications();
    }
  }, [state.data, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Computed values
  const unreadCount = state.data?.filter(notif => !notif.read).length || 0;
  const notifications = state.data || [];

  return {
    ...state,
    notifications,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
