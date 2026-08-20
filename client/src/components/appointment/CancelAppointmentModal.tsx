import React from 'react';
import { Appointment } from '../../types/appointment';
import { AlertTriangle, Calendar, Clock, X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="glass-card modal-container">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="modal-icon-badge modal-icon-danger">
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cancel Appointment</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.25rem' }}>
            Are you sure you want to cancel this consultation? The slot will be released back to the doctor's calendar.
          </p>

          <div className="modal-summary-box">
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {appointment.doctorName}
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="var(--primary)" />
                <span>{appointment.date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="var(--primary)" />
                <span>{appointment.startTime} - {appointment.endTime}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Keep Appointment
          </button>
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="spinner" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
