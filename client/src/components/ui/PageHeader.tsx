import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div className={`page-header-ui ${className}`}>
      <div className="page-header-content">
        <div className="page-header-title-row">
          <h1 className="page-header-title">{title}</h1>
          {badge && <div className="page-header-badge">{badge}</div>}
        </div>
        {description && <p className="page-header-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
