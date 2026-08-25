import React from 'react';
import { Stethoscope } from 'lucide-react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  message?: string;
  subtext?: string;
  isExiting?: boolean;
  className?: string;
}

/**
 * Level 1: Global Branded Loader (Used ONLY for initial application boot & session restoration)
 */
export const FullScreenLoader: React.FC<LoadingScreenProps> = ({
  message = 'Preparing HealthPulse',
  subtext = 'Securing your clinical workspace',
  isExiting = false,
  className = '',
}) => {
  return (
    <div
      className={`hp-loader ${isExiting ? 'hp-loader--exiting' : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${message}. ${subtext}`}
    >
      <div className="hp-loader__content">
        {/* Geometric Contour with Traveling Illuminated Segment */}
        <div className="hp-loader__graphic" aria-hidden="true">
          <svg className="hp-loader__svg" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="hp-tracer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="50%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>

            {/* Subtle Lower-Left Container */}
            <rect className="hp-loader__square" x="12" y="48" width="28" height="28" />

            {/* Base Geometric Guideline */}
            <path
              className="hp-loader__track"
              d="M 52 16 L 16 16 L 16 38 Q 16 58 38 62 L 56 62 Q 74 62 74 46 L 74 32"
            />

            {/* Illuminated Traveling Circuit Segment */}
            <path
              className="hp-loader__tracer"
              d="M 52 16 L 16 16 L 16 38 Q 16 58 38 62 L 56 62 Q 74 62 74 46 L 74 32"
            />
          </svg>

          {/* Central Stethoscope with Subtle Breathing Rhythm */}
          <div className="hp-loader__stethoscope">
            <Stethoscope size={32} strokeWidth={2} />
          </div>
        </div>

        {/* Title with Subtle Sequential Dots */}
        <h1 className="hp-loader__title">
          <span>{message}</span>
          <span className="hp-loader__dots" aria-hidden="true">
            <span className="hp-loader__dot" />
            <span className="hp-loader__dot" />
            <span className="hp-loader__dot" />
          </span>
        </h1>

        {/* Supporting Line */}
        {subtext && <p className="hp-loader__subtitle">{subtext}</p>}
      </div>
    </div>
  );
};

/**
 * Level 2: Lightweight Route Suspense Fallback
 * Shows a subtle top bar without unmounting or obscuring the portal layout
 */
export const RouteProgressFallback: React.FC = () => {
  return (
    <div className="hp-route-progress" role="progressbar" aria-label="Loading page...">
      <div className="hp-route-progress__bar" />
    </div>
  );
};

/**
 * Level 3: Button Spinner for CTA loading states
 */
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <span className={`hp-button-spinner ${className}`} aria-hidden="true" />;
};

/**
 * Level 3: Small Inline Spinner for contextual widget updates
 */
export const InlineSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`hp-inline-spinner ${className}`} aria-label="Loading" />;
};

// Aliases for compatibility
export const LoadingScreen = FullScreenLoader;
export const PageLoader = RouteProgressFallback;
export const InlineLoader = InlineSpinner;
export const LoadingSpinner = FullScreenLoader;

export default FullScreenLoader;
