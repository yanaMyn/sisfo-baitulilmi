'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Memuat...' }) => {
  return <div className="loading-fullscreen">{message}</div>;
};

export default LoadingSpinner;
