import React from 'react';
import clsx from 'clsx';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          sizeClasses[size],
          'animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500'
        )}
      />
    </div>
  );
};

export default LoadingSpinner;