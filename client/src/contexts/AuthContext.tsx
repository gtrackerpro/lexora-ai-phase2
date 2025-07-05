import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithToken: (token: string, user: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lexora_token');
      const storedUser = localStorage.getItem('lexora_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.user);
            localStorage.setItem('lexora_user', JSON.stringify(response.user));
          }
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('lexora_token');
          localStorage.removeItem('lexora_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('lexora_token', response.token);
        localStorage.setItem('lexora_user', JSON.stringify(response.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const response = await authAPI.register({ email, password, displayName });
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('lexora_token', response.token);
        localStorage.setItem('lexora_user', JSON.stringify(response.user));
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const loginWithToken = async (token: string, user: User) => {
    try {
      localStorage.setItem('lexora_token', token);
      localStorage.setItem('lexora_user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lexora_token');
    localStorage.removeItem('lexora_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('lexora_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    login,
    register,
    loginWithToken,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};