import React from 'react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'compact';
  title?: string;
  message?: string;
  subtext?: string;
  className?: string;
}

// Helper to generate pointy-topped hexagon path
const getHexagonPoints = (cx: number, cy: number, r: number) => {
  const h = (Math.sqrt(3) / 2) * r;
  return [
    `${cx},${cy - r}`,
    `${cx + h},${cy - r / 2}`,
    `${cx + h},${cy + r / 2}`,
    `${cx},${cy + r}`,
    `${cx - h},${cy + r / 2}`,
    `${cx - h},${cy - r / 2}`,
  ].join(' ');
};

export const HexagonCluster: React.FC<{ size?: number }> = () => {
  const r = 26; // Main hexagon radius

  // Centers of the honeycomb hexagons
  const centerHex = { cx: 130, cy: 95 };
  const topRightHex = { cx: 152.5, cy: 56 };
  const bottomRightHex = { cx: 152.5, cy: 134 };
  const topLeftHex = { cx: 107.5, cy: 56 };
  const bottomLeftHex = { cx: 107.5, cy: 134 };
  const leftHex = { cx: 85, cy: 95 };
  const rightHex = { cx: 175, cy: 95 };

  // Small floating outer nodes
  const outerLeftHex = { cx: 48, cy: 120, r: 12 };
  const outerTopRightHex = { cx: 202, cy: 58, r: 12 };

  return (
    <div className="honey-cluster-container" aria-hidden="true">
      <svg className="honey-cluster-svg" viewBox="0 0 250 190">
        <defs>
          <linearGradient id="honey-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>

        {/* 1. Outer Floating Small Hexagons */}
        <polygon
          className="honey-hex-base honey-hex-floating-left"
          points={getHexagonPoints(outerLeftHex.cx, outerLeftHex.cy, outerLeftHex.r)}
        />
        <polygon
          className="honey-hex-base honey-hex-floating-right"
          points={getHexagonPoints(outerTopRightHex.cx, outerTopRightHex.cy, outerTopRightHex.r)}
        />

        {/* 2. Base Grid Hexagons (Outlines) */}
        <polygon
          className="honey-hex-base"
          points={getHexagonPoints(topLeftHex.cx, topLeftHex.cy, r)}
        />
        <polygon
          className="honey-hex-base"
          points={getHexagonPoints(leftHex.cx, leftHex.cy, r)}
        />
        <polygon
          className="honey-hex-base"
          points={getHexagonPoints(bottomLeftHex.cx, bottomLeftHex.cy, r)}
        />
        <polygon
          className="honey-hex-base"
          points={getHexagonPoints(rightHex.cx, rightHex.cy, r)}
        />

        {/* 3. Active Highlighted Hexagons with Purple Glow */}
        {/* Top-Right Active Hexagon */}
        <polygon
          className="honey-hex-active honey-hex-active-1"
          points={getHexagonPoints(topRightHex.cx, topRightHex.cy, r)}
        />
        <path
          className="honey-check honey-check-1"
          d={`M ${topRightHex.cx - 6} ${topRightHex.cy} L ${topRightHex.cx - 1.5} ${topRightHex.cy + 4.5} L ${topRightHex.cx + 6.5} ${topRightHex.cy - 4.5}`}
        />

        {/* Center Active Hexagon */}
        <polygon
          className="honey-hex-active honey-hex-active-2"
          points={getHexagonPoints(centerHex.cx, centerHex.cy, r)}
        />
        <path
          className="honey-check honey-check-2"
          d={`M ${centerHex.cx - 6} ${centerHex.cy} L ${centerHex.cx - 1.5} ${centerHex.cy + 4.5} L ${centerHex.cx + 6.5} ${centerHex.cy - 4.5}`}
        />

        {/* Bottom-Right Active Hexagon */}
        <polygon
          className="honey-hex-active honey-hex-active-3"
          points={getHexagonPoints(bottomRightHex.cx, bottomRightHex.cy, r)}
        />
        <path
          className="honey-check honey-check-3"
          d={`M ${bottomRightHex.cx - 6} ${bottomRightHex.cy} L ${bottomRightHex.cx - 1.5} ${bottomRightHex.cy + 4.5} L ${bottomRightHex.cx + 6.5} ${bottomRightHex.cy - 4.5}`}
        />
      </svg>
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'page',
  title,
  message,
  subtext = 'This may take few minutes',
  className = '',
}) => {
  const containerClass =
    variant === 'fullscreen'
      ? `honey-loader-fullscreen ${className}`
      : variant === 'compact'
      ? `honey-loader-compact ${className}`
      : `honey-loader-page ${className}`;

  const displayTitle = title || message || 'Performing HealthPulse magic';

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={displayTitle}>
      <div className="honey-loader-content">
        {/* Animated Hexagonal Honeycomb Cluster */}
        <HexagonCluster />

        {/* Bold Modern Headline */}
        <h2 className="honey-loader-title">{displayTitle}</h2>

        {/* Minimal Linear Progress Bar */}
        <div className="honey-progress-track">
          <div className="honey-progress-bar" />
        </div>

        {/* Helper Subtext */}
        {subtext && <p className="honey-loader-subtext">{subtext}</p>}
      </div>
    </div>
  );
};

export const FullScreenLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="fullscreen" title="Performing HealthPulse magic" subtext="This may take few minutes" {...props} />
);

export const PageLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="page" title="Performing HealthPulse magic" subtext="This may take few minutes" {...props} />
);

export const InlineLoader: React.FC<Omit<LoadingScreenProps, 'variant'>> = (props) => (
  <LoadingScreen variant="compact" subtext="Please wait a moment..." {...props} />
);

export const LoadingSpinner = HexagonCluster;

export default LoadingScreen;
