'use client';

import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin mx-auto mb-4`} />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
