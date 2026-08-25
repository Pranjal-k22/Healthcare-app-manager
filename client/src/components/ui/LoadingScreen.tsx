import React from 'react';
import { Stethoscope } from 'lucide-react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'compact';
  message?: string;
  subtext?: string;
  className?: string;
}

export const StethoscopeLoaderGraphic: React.FC = () => {
  return (
    <div className="steth-frame-container" aria-hidden="true">
      <svg className="steth-frame-svg" viewBox="0 0 100 100">
        {/* Lower Left Dark Container Box */}
        <rect
          className="steth-square-bg"
          x="14"
          y="48"
          width="26"
          height="26"
          rx="5"
        />

        {/* Base Geometric Guideline Path */}
        <path
          className="steth-geo-bg"
          d="M 52 18 L 18 18 L 18 40 Q 18 56 36 60 L 56 60 Q 72 60 72 46 L 72 34"
        />

        {/* Animated Neon Green Traveling Path */}
        <path
          className="steth-geo-neon"
          d="M 52 18 L 18 18 L 18 40 Q 18 56 36 60 L 56 60 Q 72 60 72 46 L 72 34"
        />
      </svg>

      {/* Pulsing Stethoscope Icon in the Center */}
      <div className="steth-center-icon">
        <Stethoscope size={28} strokeWidth={2.4} />
      </div>
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'page',
  message = 'Loading',
  subtext,
  className = '',
}) => {
  const containerClass =
    variant === 'fullscreen'
      ? `steth-loader-fullscreen ${className}`
      : variant === 'compact'
      ? `steth-loader-compact ${className}`
      : `steth-loader-page ${className}`;

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={message || 'Loading'}>
      <div className="steth-loader-content">
        {/* Centered Stethoscope Neon Frame Graphic */}
        <StethoscopeLoaderGraphic />

        {/* Clean "Loading" Headline */}
        <h2 className="steth-loader-title">{message}</h2>

        {/* Optional Subtext */}
        {subtext && <p className="steth-loader-subtext">{subtext}</p>}
      </div>
    </div>
  );
};

export const FullScreenLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="fullscreen" message="Loading" {...props} />
);

export const PageLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="page" message="Loading" {...props} />
);

export const InlineLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="compact" message="Loading" {...props} />
);

export const LoadingSpinner = StethoscopeLoaderGraphic;

export default LoadingScreen;
