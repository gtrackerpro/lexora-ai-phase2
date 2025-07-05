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
  Award
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Learning', path: '/learning' },
    { icon: Play, label: 'Continue Watching', path: '/continue' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { icon: Clock, label: 'Recent', path: '/recent' },
    { icon: Award, label: 'Achievements', path: '/achievements' },
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
      className="w-64 bg-dark-800 border-r border-dark-700 h-screen sticky top-16 overflow-y-auto"
    >
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-dark-700">
          <nav className="space-y-2">
            {bottomItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-dark-700 rounded-lg">
          <h3 className="text-sm font-medium text-white mb-3">This Week</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-dark-300">Lessons Completed</span>
              <span className="text-primary-400 font-medium">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-300">Hours Learned</span>
              <span className="text-primary-400 font-medium">8.5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-300">Streak</span>
              <span className="text-primary-400 font-medium">5 days</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;