import React from 'react';
import { Link } from 'react-router-dom';
import { Appointment } from '../../types/appointment';
import StatusBadge from '../ui/StatusBadge';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { formatDateIndian, formatTimeIndian } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Pill,
  RefreshCw,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  viewRole: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  onCancel?: (app: Appointment) => void;
  onReschedule?: (app: Appointment) => void;
  onComplete?: (app: Appointment) => void;
  isActionLoading?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  viewRole,
  onCancel,
  onReschedule,
  onComplete,
  isActionLoading = false,
}) => {
  const isBooked = appointment.status === 'BOOKED';
  const isCompleted = appointment.status === 'COMPLETED';

  return (
    <Card className="appointment-card-ui" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Card Header */}
      <div className="appointment-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="appointment-avatar">
            {viewRole === 'PATIENT' ? (
              <Stethoscope size={20} color="var(--primary)" />
            ) : (
              <User size={20} color="var(--primary-dark)" />
            )}
          </div>
          <div>
            <h4 className="appointment-person-name">
              {viewRole === 'PATIENT'
                ? `Dr. ${appointment.doctorName}`
                : appointment.patientName}
            </h4>
            <span className="appointment-person-email">
              <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
              {viewRole === 'PATIENT'
                ? appointment.doctorEmail
                : appointment.patientEmail}
            </span>
          </div>
        </div>

        <StatusBadge status={appointment.status} size="sm" />
      </div>

      {/* Card Body */}
      <div style={{ flex: 1 }}>
        <div className="appointment-timing-row">
          <div className="appointment-time-badge">
            <Calendar size={14} color="var(--primary)" />
            <span>{formatDateIndian(appointment.date)}</span>
          </div>
          <div className="appointment-time-badge">
            <Clock size={14} color="var(--primary)" />
            <span>
              {formatTimeIndian(appointment.startTime, false)} – {formatTimeIndian(appointment.endTime, false)} IST
            </span>
          </div>
        </div>

        {appointment.reason && (
          <div className="appointment-reason-box">
            <FileText size={14} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{appointment.reason}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="appointment-card-actions">
        {/* Doctor Actions */}
        {viewRole === 'DOCTOR' && (
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <Link
              to={`/doctor/consultation/${appointment.id}`}
              style={{ flex: 1 }}
            >
              <Button variant="primary" size="sm" fullWidth leftIcon={<Stethoscope size={14} />}>
                {isBooked ? 'Consultation Room' : 'View Record'}
              </Button>
            </Link>
            {isBooked && onComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onComplete(appointment)}
                disabled={isActionLoading}
              >
                Complete
              </Button>
            )}
          </div>
        )}

        {/* Patient Completed Details View */}
        {viewRole === 'PATIENT' && isCompleted && (
          <Link
            to={`/patient/appointments/${appointment.id}`}
            style={{ width: '100%' }}
          >
            <Button variant="primary" size="sm" fullWidth leftIcon={<Pill size={14} />}>
              View Summary & Prescription
            </Button>
          </Link>
        )}

        {/* Patient Active Booked Actions */}
        {isBooked && viewRole === 'PATIENT' && (
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <Link
              to={`/patient/appointments/${appointment.id}`}
              style={{ flex: 1 }}
            >
              <Button variant="outline" size="sm" fullWidth leftIcon={<ExternalLink size={13} />}>
                Details
              </Button>
            </Link>

            {onReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule(appointment)}
                disabled={isActionLoading}
                leftIcon={<RefreshCw size={13} />}
              >
                Reschedule
              </Button>
            )}

            {onCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(appointment)}
                disabled={isActionLoading}
                leftIcon={<XCircle size={13} />}
              >
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Admin Actions */}
        {viewRole === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <Link
              to={`/patient/appointments/${appointment.id}`}
              style={{ flex: 1 }}
            >
              <Button variant="outline" size="sm" fullWidth leftIcon={<ExternalLink size={13} />}>
                View Details & AI Summaries
              </Button>
            </Link>
            {isBooked && onCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onCancel(appointment)}
                disabled={isActionLoading}
                leftIcon={<XCircle size={13} />}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AppointmentCard;
