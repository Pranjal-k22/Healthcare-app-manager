import React from 'react';
import '../../styles/loading.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rectangular',
}) => {
  const style: React.CSSProperties = {
    width: width ?? (variant === 'circular' ? 40 : '100%'),
    height: height ?? (variant === 'text' ? '1rem' : variant === 'circular' ? 40 : 48),
    borderRadius:
      borderRadius ??
      (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px'),
  };

  return <div className={`skeleton-shimmer skeleton-${variant} ${className}`} style={style} />;
};

/**
 * Reusable Card Skeleton (for appointment cards, doctor cards, etc.)
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Skeleton variant="circular" width={48} height={48} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton variant="text" width="60%" height={16} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Skeleton variant="rectangular" height={36} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
    </div>
  );
};

/**
 * Reusable Table Skeleton (for doctor roster, appointments list, leave management, etc.)
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`skeleton-table ${className}`}>
      {/* Table Header Skeleton */}
      <div className="skeleton-table-row" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`th-${i}`} variant="text" height={16} width={`${100 / columns}%`} />
        ))}
      </div>
      {/* Table Body Rows Skeleton */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`tr-${r}`} className="skeleton-table-row" style={{ padding: '0.5rem 0' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`td-${r}-${c}`} variant="rectangular" height={32} width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Reusable Profile Skeleton (for Doctor/Patient details view)
 */
export const SkeletonProfile: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`skeleton-card ${className}`} style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Skeleton variant="circular" width={80} height={80} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="25%" height={16} />
          <Skeleton variant="rectangular" width="30%" height={24} borderRadius={16} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="rectangular" height={120} />
      </div>
    </div>
  );
};

export default Skeleton;
