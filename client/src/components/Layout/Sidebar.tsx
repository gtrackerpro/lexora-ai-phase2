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
    <aside className="w-64 bg-dark-950/95 backdrop-blur-xl border-r border-dark-800/50 fixed h-[calc(100vh-4rem)] overflow-hidden hidden lg:block z-30 top-16">
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 p-6 pt-8">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30 shadow-lg'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800/50 hover:border hover:border-dark-700/50'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-dark-800/50">
          <div className="text-center">
            <p className="text-xs text-dark-500">© 2024 Lexora AI</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
