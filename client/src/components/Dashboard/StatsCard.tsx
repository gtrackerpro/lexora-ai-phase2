import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    secondary: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };

  const changeClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-dark-400',
  };

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-dark-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeClasses[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;