import React, { useMemo } from 'react';
import '../../styles/loading.css';

export interface LoadingScreenProps {
  variant?: 'fullscreen' | 'page' | 'compact';
  title?: string;
  message?: string;
  subtext?: string;
  className?: string;
}

// Generate pointy-topped hexagon polygon points string
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

export const HexagonCluster: React.FC<{ scaleModifier?: number }> = () => {
  // Generate randomized honeycomb geometry on each render / load
  const config = useMemo(() => {
    // Randomized base hexagon radius between 24 and 30px
    const r = Math.floor(Math.random() * 7) + 24;
    const h = (Math.sqrt(3) / 2) * r;
    const cx = 135;
    const cy = 100;

    // 7 Honeycomb positions
    const cells = [
      { id: 'center', cx, cy, active: true },
      { id: 'top-right', cx: cx + h, cy: cy - 1.5 * r, active: true },
      { id: 'bottom-right', cx: cx + h, cy: cy + 1.5 * r, active: true },
      { id: 'top-left', cx: cx - h, cy: cy - 1.5 * r, active: false },
      { id: 'bottom-left', cx: cx - h, cy: cy + 1.5 * r, active: false },
      { id: 'left', cx: cx - 2 * h, cy, active: false },
      { id: 'right', cx: cx + 2 * h, cy, active: false },
    ];

    // Satellites with slight random offsets
    const sat1 = {
      cx: cx - 2.8 * h + (Math.random() * 6 - 3),
      cy: cy + 0.9 * r + (Math.random() * 6 - 3),
      r: Math.round(r * 0.46),
    };
    const sat2 = {
      cx: cx + 2.8 * h + (Math.random() * 6 - 3),
      cy: cy - 1.3 * r + (Math.random() * 6 - 3),
      r: Math.round(r * 0.46),
    };

    // Calculate closed outer perimeter contour path for the traveling line tracer
    // Connecting outer vertices of the cluster
    const tr = { cx: cx + h, cy: cy - 1.5 * r };
    const tl = { cx: cx - h, cy: cy - 1.5 * r };
    const l = { cx: cx - 2 * h, cy };
    const bl = { cx: cx - h, cy: cy + 1.5 * r };
    const br = { cx: cx + h, cy: cy + 1.5 * r };
    const rCell = { cx: cx + 2 * h, cy };

    const perimeterPath = [
      `M ${tr.cx},${tr.cy - r}`,
      `L ${tr.cx + h},${tr.cy - r / 2}`,
      `L ${rCell.cx + h},${rCell.cy - r / 2}`,
      `L ${rCell.cx + h},${rCell.cy + r / 2}`,
      `L ${br.cx + h},${br.cy + r / 2}`,
      `L ${br.cx},${br.cy + r}`,
      `L ${bl.cx},${bl.cy + r}`,
      `L ${bl.cx - h},${bl.cy + r / 2}`,
      `L ${l.cx - h},${l.cy + r / 2}`,
      `L ${l.cx - h},${l.cy - r / 2}`,
      `L ${tl.cx - h},${tl.cy - r / 2}`,
      `L ${tl.cx},${tl.cy - r}`,
      'Z',
    ].join(' ');

    return { r, cells, sat1, sat2, perimeterPath, svgWidth: 270, svgHeight: 200 };
  }, []);

  return (
    <div className="honey-cluster-container" aria-hidden="true">
      <svg className="honey-cluster-svg" width={config.svgWidth} height={config.svgHeight} viewBox="0 0 270 200">
        <defs>
          <linearGradient id="honey-tracer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#A855F7" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#9333EA" stopOpacity="1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 1. Outer Floating Satellites */}
        <polygon
          className="honey-hex-base honey-satellite-1"
          points={getHexagonPoints(config.sat1.cx, config.sat1.cy, config.sat1.r)}
        />
        <polygon
          className="honey-hex-base honey-satellite-2"
          points={getHexagonPoints(config.sat2.cx, config.sat2.cy, config.sat2.r)}
        />

        {/* 2. Base & Active Hexagon Cells */}
        {config.cells.map((cell) => {
          const points = getHexagonPoints(cell.cx, cell.cy, config.r);
          if (cell.active) {
            return (
              <g key={cell.id} className="honey-hex-glow-anim">
                <polygon className="honey-hex-active" points={points} />
                <path
                  className="honey-check"
                  d={`M ${cell.cx - 6} ${cell.cy} L ${cell.cx - 1.5} ${cell.cy + 4.5} L ${cell.cx + 6.5} ${cell.cy - 4.5}`}
                />
              </g>
            );
          }
          return <polygon key={cell.id} className="honey-hex-base" points={points} />;
        })}

        {/* 3. Outer Continuous Perimeter Contour with Traveling Glowing Line */}
        <path className="honey-perimeter-bg" d={config.perimeterPath} />
        <path className="honey-perimeter-tracer" d={config.perimeterPath} />
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
        {/* Animated Hexagonal Honeycomb Cluster with Traveling Outer Line */}
        <HexagonCluster />

        {/* Bold Headline */}
        <h2 className="honey-loader-title">{displayTitle}</h2>

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
