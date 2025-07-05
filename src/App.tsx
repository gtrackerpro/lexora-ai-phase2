import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import CreateTopic from './pages/CreateTopic';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create-topic" element={<CreateTopic />} />
              <Route path="learning" element={<div className="text-white">Learning Page - Coming Soon</div>} />
              <Route path="learning/:id" element={<div className="text-white">Learning Path Detail - Coming Soon</div>} />
              <Route path="continue" element={<div className="text-white">Continue Watching - Coming Soon</div>} />
              <Route path="progress" element={<div className="text-white">Progress Page - Coming Soon</div>} />
              <Route path="favorites" element={<div className="text-white">Favorites - Coming Soon</div>} />
              <Route path="recent" element={<div className="text-white">Recent - Coming Soon</div>} />
              <Route path="achievements" element={<div className="text-white">Achievements - Coming Soon</div>} />
              <Route path="profile" element={<div className="text-white">Profile - Coming Soon</div>} />
              <Route path="settings" element={<div className="text-white">Settings - Coming Soon</div>} />
              <Route path="help" element={<div className="text-white">Help - Coming Soon</div>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
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
  );
}

export default App;