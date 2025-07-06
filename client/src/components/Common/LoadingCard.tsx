import React from 'react';

interface LoadingCardProps {
  className?: string;
  height?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ 
  className = '', 
  height = 'h-64' 
}) => {
  return (
    <div className={`bg-dark-900/80 border border-dark-800 rounded-lg p-4 ${height} ${className}`}>
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-dark-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-700 rounded w-3/4"></div>
            <div className="h-3 bg-dark-800 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-3 bg-dark-700 rounded"></div>
          <div className="h-3 bg-dark-700 rounded w-5/6"></div>
          <div className="h-3 bg-dark-700 rounded w-4/6"></div>
        </div>
        
        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-dark-800 rounded w-16"></div>
            <div className="h-3 bg-dark-800 rounded w-12"></div>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-2">
            <div className="bg-dark-700 h-2 rounded-full w-1/3"></div>
          </div>
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-dark-700 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export const LoadingGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 4, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
};

export default LoadingCard;