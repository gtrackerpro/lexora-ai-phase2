import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-black-950/80 backdrop-blur-xl border-b border-dark-800/50">
      <div className="container-fluid">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative p-1 rounded-xl">
              <img 
                src="/lexora-logo.png" 
                alt="Lexora Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              Lexora
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400 h-4 w-4 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="text"
                placeholder="Search topics, lessons, or anything..."
                className="w-full pl-12 pr-4 py-3 bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-2xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 hover:border-dark-600"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search */}
            <button className="p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200 md:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-error-500 to-error-600 rounded-full border-2 border-black-950 animate-pulse"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-dark-800/50 rounded-lg transition-all duration-200"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user?.displayName}
                  </p>
                  <p className="text-xs text-dark-400">{user?.email}</p>
                </div>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-dark-900/95 backdrop-blur-xl border border-dark-700 rounded-2xl shadow-dark-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-dark-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center overflow-hidden">
                          {user?.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.displayName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user?.displayName}</p>
                          <p className="text-sm text-dark-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-xl transition-all duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Preferences</span>
                      </Link>
                      
                      <div className="border-t border-dark-800 my-2"></div>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-error-400 hover:text-error-300 hover:bg-error-500/10 rounded-xl transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-dark-800 bg-dark-900/95 backdrop-blur-xl"
          >
            <div className="container-fluid py-4">
              <div className="space-y-2">
                <Link
                  to="/dashboard" 
                  className="block px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/learning"
                  className="block px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Learning
                </Link>
                <Link
                  to="/progress"
                  className="block px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Progress
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;