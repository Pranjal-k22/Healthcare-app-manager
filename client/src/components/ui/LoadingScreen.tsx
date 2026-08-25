import React from 'react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  return <div className={`simple-spinner simple-spinner-${size} ${className}`} aria-hidden="true" />;
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'page',
  size = 'md',
  message,
  className = '',
}) => {
  const containerClass =
    variant === 'fullscreen'
      ? `simple-loader-fullscreen ${className}`
      : variant === 'inline'
      ? `simple-loader-inline ${className}`
      : `simple-loader-page ${className}`;

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={message || 'Loading'}>
      <LoadingSpinner size={size} />
      {message && <p className="simple-loader-text">{message}</p>}
    </div>
  );
};

export const FullScreenLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="fullscreen" size="lg" message="Loading..." {...props} />
);

export const PageLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="page" size="md" message="Loading..." {...props} />
);

export const InlineLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="inline" size="sm" {...props} />
);

export default LoadingScreen;
