import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Video, 
  BarChart3, 
  Settings, 
  Plus,
  GraduationCap,
  Target
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/topics', icon: BookOpen, label: 'Topics' },
    { to: '/learning-paths', icon: Target, label: 'Learning Paths' },
    { to: '/lessons', icon: GraduationCap, label: 'Lessons' },
    { to: '/videos', icon: Video, label: 'Videos' },
    { to: '/progress', icon: BarChart3, label: 'Progress' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-700 min-h-screen">
      <div className="p-6">
        <NavLink
          to="/create-topic"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Topic</span>
        </NavLink>
      </div>

      <nav className="px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
        <div className="bg-dark-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-2">Learning Streak</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-dark-700 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full w-3/4"></div>
            </div>
            <span className="text-xs text-dark-400">7 days</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;