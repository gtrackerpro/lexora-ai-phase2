import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import CreateTopic from './pages/CreateTopic';
import LearningPath from './pages/LearningPath';
import LessonViewer from './pages/LessonViewer';
import ProfileSettings from './pages/ProfileSettings';
import { analytics } from './utils/analytics';
import { performanceMonitor } from './utils/performance';

// Initialize analytics and performance monitoring
if (typeof window !== 'undefined') {
  // Track initial page load
  analytics.trackPageView(window.location.pathname);
  
  // Monitor performance
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-dark-950">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-topic"
                element={
                  <ProtectedRoute>
                    <CreateTopic />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning/:id"
                element={
                  <ProtectedRoute>
                    <LearningPath />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/:id"
                element={
                  <ProtectedRoute>
                    <LessonViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#ffffff',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;