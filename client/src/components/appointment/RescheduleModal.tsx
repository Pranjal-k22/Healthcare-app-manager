import React, { useState, useEffect } from 'react';
import { Appointment, AvailableSlot } from '../../types/appointment';
import { getAvailableSlots } from '../../services/appointmentApi';
import { SlotPicker } from './SlotPicker';
import { AlertCircle, Calendar, RefreshCw, X, User } from 'lucide-react';
import Button from '../ui/Button';

interface RescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newStartTime: string) => Promise<void>;
  isProcessing: boolean;
  error?: string | null;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  error = null,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Initialize date when opened
  useEffect(() => {
    if (isOpen && appointment) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(appointment.date >= today ? appointment.date : today);
      setSelectedSlot(null);
    }
  }, [isOpen, appointment]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!appointment || !selectedDate) return;
      try {
        setIsLoadingSlots(true);
        setFetchError(null);
        setSelectedSlot(null);
        const data = await getAvailableSlots(appointment.doctorId, selectedDate);
        setSlots(data);
      } catch (err: any) {
        setFetchError(err.message || 'Failed to retrieve available slots');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (isOpen && appointment && selectedDate) {
      fetchSlots();
    }
  }, [isOpen, appointment, selectedDate]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    onConfirm(selectedDate, selectedSlot);
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-content-card modal-anim-scale"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: '620px', width: '100%' }}
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
          <div className="dialog-icon-wrapper dialog-icon-primary-bg">
            <RefreshCw size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 className="dialog-title card-title" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Reschedule Consultation
            </h3>
            <p className="body-text" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Select a new date and open time slot with <strong>Dr. {appointment.doctorName}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ margin: '1.25rem 0 0 0' }}>
            {/* Current Appointment Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <User size={15} color="var(--primary)" />
                <span>Dr. {appointment.doctorName}</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Current: <strong style={{ color: 'var(--text-secondary)' }}>{appointment.date} ({appointment.startTime})</strong>
              </div>
            </div>

            {/* Date Input Field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="rescheduleDate"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                <Calendar size={15} color="var(--primary)" />
                <span>New Consultation Date</span>
              </label>
              <input
                id="rescheduleDate"
                type="date"
                className="input-field-ui"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{ width: '100%' }}
              />
            </div>

            {fetchError && (
              <div className="alert-inline alert-inline-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={15} />
                <span>{fetchError}</span>
              </div>
            )}

            {/* Slot Picker Component */}
            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              isLoading={isLoadingSlots}
            />

            {error && (
              <div className="alert-inline alert-inline-error" style={{ marginTop: '1.25rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div
            className="dialog-actions"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isProcessing || !selectedSlot || !selectedDate}
              isLoading={isProcessing}
            >
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
