import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading your data. Please try again.',
  onRetry,
  onGoHome,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-error-400" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>

      <p className="text-dark-300 mb-6 max-w-md">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary px-4 py-2 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="btn-secondary px-4 py-2 flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;