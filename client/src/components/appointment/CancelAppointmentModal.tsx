import React from 'react';
import { Appointment } from '../../types/appointment';
import { AlertCircle, Calendar, Clock, X, User } from 'lucide-react';
import Button from '../ui/Button';

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
  error?: string | null;
}

export const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  error = null,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-content-card modal-anim-scale"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '480px' }}
      >
        <button
          type="button"
          className="dialog-close-btn"
          onClick={onClose}
          disabled={isProcessing}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="dialog-header">
          <div className="dialog-icon-wrapper dialog-icon-danger-bg">
            <AlertCircle size={24} className="dialog-icon-danger" color="var(--danger)" />
          </div>
          <div>
            <h3 className="dialog-title card-title" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Cancel Consultation
            </h3>
            <p className="body-text" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Are you sure you want to cancel this appointment? The reserved slot will be released back to the doctor's schedule.
            </p>
          </div>
        </div>

        {/* Appointment Context Summary Card */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.15rem',
            margin: '1.25rem 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <User size={16} color="var(--primary)" />
            <span>Dr. {appointment.doctorName}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} color="var(--primary)" />
              <span style={{ fontWeight: 500 }}>{appointment.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="var(--primary)" />
              <span style={{ fontWeight: 500 }}>{appointment.startTime} – {appointment.endTime}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert-inline alert-inline-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="dialog-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
          >
            Keep Appointment
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={isProcessing}
          >
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </div>
  );
};
