import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  imageSrc?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  imageSrc,
  title,
  description,
  action,
  className = '',
  style,
}) => {
  return (
    <div className={`empty-state-ui ${className}`} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          style={{ width: '160px', height: '120px', objectFit: 'contain', marginBottom: '1.25rem' }}
        />
      ) : icon ? (
        <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>{icon}</div>
      ) : null}
      <h3 className="empty-state-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{title}</h3>
      {description && <p className="empty-state-description" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
