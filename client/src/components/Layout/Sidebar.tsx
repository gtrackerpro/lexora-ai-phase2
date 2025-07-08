import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Plus,
  Zap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Learning', path: '/learning' },
    { icon: Plus, label: 'Create Learning Path', path: '/create-topic' },
  ];

  const bottomItems: any[] = [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-black-950/50 backdrop-blur-xl border-r border-dark-800/50 h-screen overflow-y-auto hidden lg:block">
      <div className="p-6 space-y-8">

        {/* Main Navigation */}
        <nav className="space-y-2">
          <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-3 mb-4">
            Navigation
          </h3>
          {menuItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="bg-dark-900/80 border border-dark-800 rounded-lg p-4">
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
        </div>

        {/* Enhanced Learning Streak */}
        <div className="relative overflow-hidden rounded-lg bg-dark-900/80 border border-dark-800 p-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/lexora-logo.png" 
                alt="Lexora" 
                className="h-8 w-8 object-contain mr-2"
              />
              <span className="text-lg font-bold text-gradient">Lexora</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-400" />
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
                ></div>
              ))}
            </div>
            <p className="text-xs text-primary-400 mt-2">Keep it up! 🔥</p>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;