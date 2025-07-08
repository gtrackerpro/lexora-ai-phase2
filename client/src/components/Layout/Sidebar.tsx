import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Plus,
  Search,
  User,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'My Learning', path: '/learning' },
    { icon: Plus, label: 'Create', path: '/create-topic' },
    { icon: Search, label: 'Search', path: '/search-demo' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <aside className="w-16 sm:w-20 md:w-24 lg:w-64 bg-dark-950/95 backdrop-blur-xl border-r border-dark-800/50 fixed h-[calc(100vh-4rem)] overflow-hidden block z-30 top-16">
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 p-2 lg:p-6 pt-4 lg:pt-8">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-center lg:justify-start lg:space-x-3 px-2 lg:px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive(item.path)
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30 shadow-lg'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800/50 hover:border hover:border-dark-700/50'
                }`}
                title={item.label}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="font-medium hidden lg:block">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto hidden lg:block">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                {/* Active indicator for small screens */}
                {isActive(item.path) && (
                  <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 lg:hidden">
                    <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 lg:p-6 border-t border-dark-800/50">
          <div className="text-center">
            <p className="text-xs text-dark-500 hidden lg:block">© 2024 Lexora AI</p>
            <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto lg:hidden"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
