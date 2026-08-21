import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  noPadding = false,
  className = '',
  children,
  ...props
}) => {
  const hasHeader = title || subtitle || icon || headerAction;

  return (
    <div className={`card-ui ${noPadding ? 'no-padding' : ''} ${className}`} {...props}>
      {hasHeader && (
        <div className="card-header-ui">
          <div className="card-title-group">
            {icon && <div className="card-icon-slot">{icon}</div>}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle-text">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className={`card-body-ui ${noPadding ? 'card-body-flush' : ''}`}>{children}</div>
      {footer && <div className="card-footer-ui">{footer}</div>}
    </div>
  );
};

export default Card;
