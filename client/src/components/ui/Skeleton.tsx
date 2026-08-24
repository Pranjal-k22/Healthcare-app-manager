import React from 'react';

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

export default Skeleton;
