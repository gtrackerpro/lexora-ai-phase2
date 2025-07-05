import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative overflow-hidden"
    >
      {/* Background Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur`}></div>
      
      {/* Card Content */}
      <div className="relative glass-card hover:border-dark-600 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-dark-400 mb-1">{title}</p>
            <motion.p 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {value}
            </motion.p>
            {change && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`flex items-center space-x-1 text-sm ${changeColors[changeType]}`}
              >
                <span className="text-xs">{changeIcons[changeType]}</span>
                <span>{change}</span>
              </motion.div>
            )}
          </div>
          
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.1, type: 'spring', stiffness: 200 }}
            className={`relative p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:shadow-glow transition-all duration-300`}
          >
            <Icon className="h-6 w-6 text-white" />
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
          </motion.div>
        </div>

        {/* Progress Bar (if applicable) */}
        {typeof value === 'number' && value <= 100 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
            className="mt-4"
          >
            <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay: index * 0.1 + 0.7, duration: 1, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full shadow-glow-sm`}
              />
            </div>
          </motion.div>
        )}

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default StatsCard;