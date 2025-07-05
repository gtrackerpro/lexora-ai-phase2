import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored auth data on app load
    const token = localStorage.getItem('lexora_token');
    const userData = localStorage.getItem('lexora_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        localStorage.removeItem('lexora_token');
        localStorage.removeItem('lexora_user');
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        _id: '1',
        email,
        display_name: email.split('@')[0],
        preferences: {
          gender_voice: 'neutral',
          learning_style: 'visual',
        },
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      const token = 'mock_jwt_token';
      
      localStorage.setItem('lexora_token', token);
      localStorage.setItem('lexora_user', JSON.stringify(mockUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        _id: '1',
        email,
        display_name: displayName,
        preferences: {
          gender_voice: 'neutral',
          learning_style: 'visual',
        },
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      
      const token = 'mock_jwt_token';
      
      localStorage.setItem('lexora_token', token);
      localStorage.setItem('lexora_user', JSON.stringify(mockUser));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token } });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('lexora_token');
    localStorage.removeItem('lexora_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('lexora_user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};