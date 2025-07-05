import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Lexora
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search topics, lessons..."
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-dark-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.display_name}</p>
                <p className="text-xs text-dark-400">{user?.email}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="p-2 text-dark-400 hover:text-white transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                
                <Link
                  to="/settings"
                  className="p-2 text-dark-400 hover:text-white transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;