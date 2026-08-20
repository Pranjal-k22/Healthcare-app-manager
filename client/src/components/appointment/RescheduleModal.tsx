import React, { useState, useEffect } from 'react';
import { Appointment, AvailableSlot } from '../../types/appointment';
import { getAvailableSlots } from '../../services/appointmentApi';
import { SlotPicker } from './SlotPicker';
import { AlertCircle, Calendar, RefreshCw, X } from 'lucide-react';

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
    <div className="modal-overlay">
      <div className="glass-card modal-container" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="modal-icon-badge">
              <RefreshCw size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reschedule Appointment</h3>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Choose a new consultation date and time slot with <strong>{appointment.doctorName}</strong>.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="rescheduleDate">
                <Calendar size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                New Consultation Date
              </label>
              <input
                id="rescheduleDate"
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {fetchError && (
              <div className="alert alert-error" style={{ padding: '0.65rem 0.85rem' }}>
                <AlertCircle size={15} />
                <span>{fetchError}</span>
              </div>
            )}

            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              isLoading={isLoadingSlots}
            />

            {error && (
              <div className="alert alert-error" style={{ marginTop: '1rem', marginBottom: 0 }}>
                <AlertCircle size={16} />
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
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing || !selectedSlot || !selectedDate}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <span>Confirm Reschedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
