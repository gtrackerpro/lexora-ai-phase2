import { useState, useEffect } from 'react';
import { topicsAPI } from '../services/api';

interface LoadingState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export const useTopics = () => {
  const [state, setState] = useState<LoadingState<Topic[]>>({
    isLoading: true,
    error: null,
    data: null
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const response = await topicsAPI.getAll();
        
        if (response.success) {
          setState({ 
            isLoading: false, 
            error: null, 
            data: response.topics 
          });
        } else {
          throw new Error('Failed to fetch topics');
        }
      } catch (error: any) {
        setState({ 
          isLoading: false, 
          error: error.message || 'Failed to load topics', 
          data: null 
        });
      }
    };
    
    fetchTopics();
  }, []);

  const refetch = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Re-trigger the effect by updating a dependency
  };

  return { ...state, refetch };
};