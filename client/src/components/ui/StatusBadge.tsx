import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  CalendarCheck,
  Activity,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

export type BadgeStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CONFIRMED'
  | 'BOOKED'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | string;

export interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normalizedStatus = (status || '').toUpperCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'ACTIVE':
        return {
          variantClass: 'badge-status-active',
          displayLabel: label || 'Active',
          icon: <CheckCircle2 size={13} />,
        };
      case 'PENDING':
        return {
          variantClass: 'badge-status-pending',
          displayLabel: label || 'Pending',
          icon: <Clock size={13} />,
        };
      case 'CANCELLED':
      case 'CANCELED':
        return {
          variantClass: 'badge-status-cancelled',
          displayLabel: label || 'Cancelled',
          icon: <XCircle size={13} />,
        };
      case 'COMPLETED':
        return {
          variantClass: 'badge-status-completed',
          displayLabel: label || 'Completed',
          icon: <FileCheck size={13} />,
        };
      case 'CONFIRMED':
      case 'BOOKED':
        return {
          variantClass: 'badge-status-confirmed',
          displayLabel: label || (normalizedStatus === 'BOOKED' ? 'Booked' : 'Confirmed'),
          icon: <CalendarCheck size={13} />,
        };
      case 'IN_PROGRESS':
        return {
          variantClass: 'badge-status-inprogress',
          displayLabel: label || 'In Progress',
          icon: <Activity size={13} />,
        };
      case 'EXPIRED':
        return {
          variantClass: 'badge-status-expired',
          displayLabel: label || 'Expired',
          icon: <AlertTriangle size={13} />,
        };
      case 'APPROVED':
        return {
          variantClass: 'badge-status-active',
          displayLabel: label || 'Approved',
          icon: <ShieldCheck size={13} />,
        };
      case 'REJECTED':
        return {
          variantClass: 'badge-status-cancelled',
          displayLabel: label || 'Rejected',
          icon: <XCircle size={13} />,
        };
      default:
        return {
          variantClass: 'badge-status-neutral',
          displayLabel: label || status || 'Unknown',
          icon: <Clock size={13} />,
        };
    }
  };

  const { variantClass, displayLabel, icon } = getStatusConfig();

  return (
    <span className={`status-badge-ui ${variantClass} status-badge-size-${size} ${className}`}>
      {showIcon && <span className="status-badge-icon">{icon}</span>}
      <span className="status-badge-text">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
