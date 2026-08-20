import React from 'react';
import { Link } from 'react-router-dom';
import { Appointment } from '../../types/appointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import {
  Calendar,
  CheckCircle2,
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
    <div className="glass-card appointment-card">
      <div className="appointment-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="appointment-avatar">
            {viewRole === 'PATIENT' ? (
              <Stethoscope size={20} color="var(--primary)" />
            ) : (
              <User size={20} color="var(--accent-teal)" />
            )}
          </div>
          <div>
            <h4 className="appointment-person-name">
              {viewRole === 'PATIENT'
                ? appointment.doctorName
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

        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="appointment-card-body">
        <div className="appointment-timing-row">
          <div className="appointment-time-badge">
            <Calendar size={14} color="var(--primary)" />
            <span>{appointment.date}</span>
          </div>
          <div className="appointment-time-badge">
            <Clock size={14} color="var(--primary)" />
            <span>
              {appointment.startTime} – {appointment.endTime}
            </span>
          </div>
        </div>

        {appointment.reason && (
          <div className="appointment-reason-box">
            <FileText size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <span className="appointment-reason-text">{appointment.reason}</span>
          </div>
        )}
      </div>

      <div className="appointment-card-actions">
        {/* Doctor Actions */}
        {viewRole === 'DOCTOR' && (
          <Link
            to={`/doctor/consultation/${appointment.id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
          >
            <Stethoscope size={14} />
            <span>{isBooked ? 'Consultation Room' : 'View Clinical Record'}</span>
          </Link>
        )}

        {/* Doctor One-Click Complete (if booked) */}
        {viewRole === 'DOCTOR' && isBooked && onComplete && (
          <button
            type="button"
            className="btn btn-emerald-outline btn-sm"
            onClick={() => onComplete(appointment)}
            disabled={isActionLoading}
            title="Mark Completed"
          >
            <CheckCircle2 size={14} />
          </button>
        )}

        {/* Patient Completed Details View */}
        {viewRole === 'PATIENT' && isCompleted && (
          <Link
            to={`/patient/appointments/${appointment.id}`}
            className="btn btn-primary btn-sm btn-block"
          >
            <Pill size={14} />
            <span>View Summary & Prescription</span>
          </Link>
        )}

        {/* Patient Active Booked Actions */}
        {isBooked && viewRole === 'PATIENT' && (
          <>
            <Link
              to={`/patient/appointments/${appointment.id}`}
              className="btn btn-outline btn-sm"
            >
              <ExternalLink size={14} />
              <span>Details</span>
            </Link>

            {onReschedule && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onReschedule(appointment)}
                disabled={isActionLoading}
              >
                <RefreshCw size={14} />
                <span>Reschedule</span>
              </button>
            )}
          </>
        )}

        {/* Cancel Button (Owner/Doctor/Admin) */}
        {isBooked && onCancel && (
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => onCancel(appointment)}
            disabled={isActionLoading}
            title="Cancel Appointment"
          >
            <XCircle size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
