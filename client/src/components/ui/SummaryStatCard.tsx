import React from 'react';

export interface SummaryStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const SummaryStatCard: React.FC<SummaryStatCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = 'rgba(0, 98, 204, 0.08)',
  iconColor = 'var(--primary)',
  subtext,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`summary-stat-card-ui ${onClick ? 'is-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="stat-card-top-row">
        <span className="stat-card-label helper-text">{label}</span>
        <div
          className="stat-card-icon-wrapper"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-card-value-wrapper">
        <span className="stat-card-value">{value}</span>
      </div>
      {(subtext || trend) && (
        <div className="stat-card-footer">
          {trend && (
            <span className={`stat-trend ${trend.isPositive ? 'trend-up' : 'trend-neutral'}`}>
              {trend.value}
            </span>
          )}
          {subtext && <span className="stat-card-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
};

export default SummaryStatCard;
