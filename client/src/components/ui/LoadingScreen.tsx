import React from 'react';
import { Stethoscope } from 'lucide-react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'compact';
  message?: string;
  subtext?: string;
  showDots?: boolean;
  className?: string;
}

export const StethoscopeLoaderGraphic: React.FC = () => {
  return (
    <div className="steth-frame-container" aria-hidden="true">
      <svg className="steth-frame-svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="steth-neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Lower Left Container Box */}
        <rect
          className="steth-square-bg"
          x="12"
          y="48"
          width="28"
          height="28"
        />

        {/* Base Geometric Guideline Contour */}
        <path
          className="steth-geo-bg"
          d="M 52 16 L 16 16 L 16 38 Q 16 58 38 62 L 56 62 Q 74 62 74 46 L 74 32"
        />

        {/* Neon Green Traveling Contour Tracer */}
        <path
          className="steth-geo-neon"
          d="M 52 16 L 16 16 L 16 38 Q 16 58 38 62 L 56 62 Q 74 62 74 46 L 74 32"
        />
      </svg>

      {/* Pulsing Stethoscope Icon in the Center */}
      <div className="steth-center-icon">
        <Stethoscope size={30} strokeWidth={2.4} />
      </div>
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'page',
  message = 'Loading HealthPulse',
  subtext = 'Preparing your clinical workspace & schedule',
  showDots = true,
  className = '',
}) => {
  const containerClass =
    variant === 'fullscreen'
      ? `steth-loader-fullscreen ${className}`
      : variant === 'compact'
      ? `steth-loader-compact ${className}`
      : `steth-loader-page ${className}`;

  // Format message text without trailing dots if showDots is enabled
  const cleanMessage = message.replace(/\.+$/, '');

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={message}>
      <div className="steth-loader-content">
        {/* Centered Stethoscope Neon Contour Graphic */}
        <StethoscopeLoaderGraphic />

        {/* Aesthetic Modern Headline */}
        <h2 className="steth-loader-title">
          <span>{cleanMessage}</span>
          {showDots && (
            <span className="steth-dot-pulse" aria-hidden="true">
              <span className="steth-dot" />
              <span className="steth-dot" />
              <span className="steth-dot" />
            </span>
          )}
        </h2>

        {/* Aesthetic Subtext */}
        {subtext && <p className="steth-loader-subtext">{subtext}</p>}
      </div>
    </div>
  );
};

export const FullScreenLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="fullscreen" message="Loading HealthPulse" {...props} />
);

export const PageLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="page" message="Loading HealthPulse" {...props} />
);

export const InlineLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="compact" subtext="" {...props} />
);

export const LoadingSpinner = StethoscopeLoaderGraphic;

export default LoadingScreen;
