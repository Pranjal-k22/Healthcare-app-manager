import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle size={24} className="dialog-icon-danger" />;
      case 'warning':
        return <AlertTriangle size={24} className="dialog-icon-warning" />;
      case 'primary':
      default:
        return <Info size={24} className="dialog-icon-primary" />;
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div
        className="dialog-content-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="dialog-close-btn" onClick={onCancel} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="dialog-header">
          <div className="dialog-icon-wrapper">{getIcon()}</div>
          <div>
            <h3 className="dialog-title card-title">{title}</h3>
            <div className="dialog-message-body body-text">{message}</div>
          </div>
        </div>

        <div className="dialog-actions">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            data-testid="confirm-dialog-btn"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
