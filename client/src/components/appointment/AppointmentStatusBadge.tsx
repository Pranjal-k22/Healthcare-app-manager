import React from 'react';
import { AppointmentStatus } from '../../types/appointment';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
}) => {
  switch (status) {
    case 'BOOKED':
      return (
        <span className="status-badge status-booked">
          <Clock size={12} />
          <span>Booked</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="status-badge status-completed">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="status-badge status-cancelled">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    default:
      return <span className="status-badge">{status}</span>;
  }
};
