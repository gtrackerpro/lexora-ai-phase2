import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  type?: 'default' | 'lesson' | 'ai' | 'video';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  type = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'lesson':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={`${sizeClasses[size]} text-primary-500`}
          >
            <BookOpen />
          </motion.div>
        );
      
      case 'ai':
        return (
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut'
            }}
            className={`${sizeClasses[size]} text-accent-500`}
          >
            <Sparkles />
          </motion.div>
        );
      
      case 'video':
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className={`${sizeClasses[size]} text-primary-500`}
            >
              <Loader2 />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut'
              }}
              className="absolute inset-0 rounded-full bg-primary-500/20"
            />
          </div>
        );
      
      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${sizeClasses[size]} text-primary-500`}
          >
            <Loader2 />
          </motion.div>
        );
    }
  };

  const getLoadingText = () => {
    if (text) return text;
    
    switch (type) {
      case 'lesson':
        return 'Loading lesson...';
      case 'ai':
        return 'AI is thinking...';
      case 'video':
        return 'Generating video...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {renderSpinner()}
      
      {(text !== null) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-dark-300 ${textSizeClasses[size]} text-center`}
        >
          {getLoadingText()}
        </motion.p>
      )}
      
      {type === 'ai' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-2 text-xs text-dark-400"
        >
          <div className="flex space-x-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-1 h-1 bg-accent-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-1 h-1 bg-accent-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-1 h-1 bg-accent-500 rounded-full"
            />
          </div>
          <span>Powered by AI</span>
        </motion.div>
      )}
    </div>
  );
};

export default LoadingSpinner;