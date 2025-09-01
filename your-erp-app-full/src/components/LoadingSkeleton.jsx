import React from 'react';

const LoadingSkeleton = ({ theme, variant = 'card', className = '' }) => {
  const baseClasses = `animate-pulse rounded-lg`;

  const getSkeletonStyle = () => ({
    backgroundColor: theme.secondary,
    opacity: 0.6
  });

  switch (variant) {
    case 'card':
      return (
        <div className={`${baseClasses} p-6 ${className}`} style={getSkeletonStyle()}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-400 rounded w-1/3"></div>
            <div className="h-6 bg-gray-400 rounded w-6"></div>
          </div>
          <div className="h-8 bg-gray-400 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-1/4"></div>
        </div>
      );

    case 'chart':
      return (
        <div className={`${baseClasses} p-6 ${className}`} style={getSkeletonStyle()}>
          <div className="h-6 bg-gray-400 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-400 rounded w-full"></div>
            <div className="h-4 bg-gray-400 rounded w-5/6"></div>
            <div className="h-4 bg-gray-400 rounded w-4/6"></div>
            <div className="h-4 bg-gray-400 rounded w-3/6"></div>
            <div className="h-4 bg-gray-400 rounded w-2/6"></div>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`${baseClasses} ${className}`} style={getSkeletonStyle()}>
          <div className="h-4 bg-gray-400 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-400 rounded w-3/4"></div>
        </div>
      );

    case 'table':
      return (
        <div className={`${baseClasses} p-6 ${className}`} style={getSkeletonStyle()}>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-400 rounded flex-1"></div>
                <div className="h-4 bg-gray-400 rounded w-1/4"></div>
                <div className="h-4 bg-gray-400 rounded w-1/3"></div>
                <div className="h-4 bg-gray-400 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} ${className}`} style={getSkeletonStyle()}>
          <div className="h-4 bg-gray-400 rounded w-full"></div>
        </div>
      );
  }
};

export default LoadingSkeleton;
