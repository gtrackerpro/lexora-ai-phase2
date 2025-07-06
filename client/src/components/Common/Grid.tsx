import React from 'react';

interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  className?: string;
  children: React.ReactNode;
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12'
};

export const Grid: React.FC<GridProps> = ({ 
  cols = 1, 
  gap = 'md', 
  responsive = true, 
  className = '',
  children
}) => {
  const baseClasses = `grid ${gapClasses[gap]}`;
  
  const responsiveClasses = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12'
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };

  const gridClasses = `${baseClasses} ${responsiveClasses[cols]} ${className}`;

  return <div className={gridClasses}>{children}</div>;
};

export default Grid;
};

export default Grid;