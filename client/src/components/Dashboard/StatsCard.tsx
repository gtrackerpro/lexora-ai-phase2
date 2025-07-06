import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: string;
  index?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'primary',
  index = 0,
}) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    green: 'from-success-500 to-success-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const changeColors = {
    positive: 'text-success-400',
    negative: 'text-error-400',
    neutral: 'text-dark-400',
  };

  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→',
  };

  return (
    <div className="group relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg`}></div>
      
      {/* Card Content */}
      <div className="relative bg-dark-900/80 border border-dark-800 rounded-lg p-4 hover:border-dark-700 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-dark-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white mb-2">
              {value}
            </p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${changeColors[changeType]}`}>
                <span className="text-xs">{changeIcons[changeType]}</span>
                <span>{change}</span>
              </div>
            )}
          </div>
          
          {/* Icon */}
          <div className={`relative p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        {typeof value === 'number' && value <= 100 && (
          <div className="mt-4">
            <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
      </div>
    </div>
  );
};

export default StatsCard;