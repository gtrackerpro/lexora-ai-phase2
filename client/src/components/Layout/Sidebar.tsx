import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Play,
  TrendingUp,
  User,
  Settings,
  HelpCircle,
  Star,
  Clock,
  Award,
  Plus,
  Zap,
  Target,
  Calendar
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: 'My Learning', path: '/learning', color: 'from-green-500 to-green-600' },
    { icon: Play, label: 'Continue Watching', path: '/continue', color: 'from-purple-500 to-purple-600' },
    { icon: TrendingUp, label: 'Progress', path: '/progress', color: 'from-orange-500 to-orange-600' },
    { icon: Star, label: 'Favorites', path: '/favorites', color: 'from-yellow-500 to-yellow-600' },
    { icon: Clock, label: 'Recent', path: '/recent', color: 'from-pink-500 to-pink-600' },
    { icon: Award, label: 'Achievements', path: '/achievements', color: 'from-indigo-500 to-indigo-600' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-black-950/50 backdrop-blur-xl border-r border-dark-800/50 h-screen sticky top-16 overflow-y-auto hidden lg:block"
    >
      <div className="p-6 space-y-8">
        {/* Create New Button */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/create-topic"
            className="group relative w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create Learning Path</span>
          </Link>
        </motion.div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-3 mb-4">
            Navigation
          </h3>
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Link
                to={item.path}
                className={`group relative flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-primary-400 border border-primary-600/30 shadow-glow-sm'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive(item.path) ? `bg-gradient-to-r ${item.color}` : 'bg-dark-800 group-hover:bg-dark-700'} transition-all duration-200`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-3 w-2 h-2 bg-primary-500 rounded-full shadow-glow-sm"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">This Week</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-300">Lessons Completed</span>
              <span className="text-sm font-semibold text-primary-400">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-300">Hours Learned</span>
              <span className="text-sm font-semibold text-success-400">8.5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-300">Current Streak</span>
              <span className="text-sm font-semibold text-accent-400">5 days</span>
            </div>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-dark-400 text-center">75% to weekly goal</p>
          </div>
        </motion.div>

        {/* Learning Streak */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20"></div>
          <div className="relative p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/lexora-logo.png" 
                alt="Lexora" 
                className="h-8 w-8 object-contain mr-2"
              />
              <span className="text-lg font-bold text-gradient">Lexora</span>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Zap className="w-6 h-6 text-yellow-400 animate-bounce-subtle" />
              <h3 className="text-lg font-bold text-white">Learning Streak</h3>
            </div>
            <div className="text-3xl font-bold text-gradient mb-2">15</div>
            <p className="text-sm text-dark-300 mb-3">Days in a row</p>
            <div className="flex justify-center space-x-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < 5 ? 'bg-primary-500 shadow-glow-sm' : 'bg-dark-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-primary-400 mt-2">Keep it up! 🔥</p>
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <div className="border-t border-dark-800 pt-6">
          <nav className="space-y-2">
            <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-3 mb-4">
              Account
            </h3>
            {bottomItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <div className="p-2 rounded-lg bg-dark-800 group-hover:bg-dark-700 transition-all duration-200">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;