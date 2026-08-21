import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface InlineAlertProps {
  type?: AlertType;
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="alert-icon-success" />;
      case 'danger':
        return <AlertCircle size={18} className="alert-icon-danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="alert-icon-warning" />;
      case 'info':
      default:
        return <Info size={18} className="alert-icon-info" />;
    }
  };

  return (
    <div className={`inline-alert-ui alert-${type} ${className}`} role="alert">
      <div className="alert-icon-container">{getIcon()}</div>
      <div className="alert-text-container">
        {title && <h5 className="alert-heading">{title}</h5>}
        <div className="alert-body-content">{message || children}</div>
      </div>
      {onClose && (
        <button className="alert-dismiss-btn" onClick={onClose} aria-label="Dismiss alert">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default InlineAlert;
