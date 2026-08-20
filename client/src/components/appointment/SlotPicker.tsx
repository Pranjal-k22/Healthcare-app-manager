import React from 'react';
import { AvailableSlot } from '../../types/appointment';
import { Clock, Ban } from 'lucide-react';

interface SlotPickerProps {
  slots: AvailableSlot[];
  selectedSlot: string | null;
  onSelectSlot: (startTime: string) => void;
  isLoading?: boolean;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="slot-picker-loading">
        <div className="spinner" style={{ width: '24px', height: '24px' }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Calculating available consultation slots...
        </span>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="empty-slots-card">
        <Ban size={28} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          No consultation slots available on this date. Doctor may be off duty, on leave, or fully booked.
        </p>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="slot-picker-container">
      <div className="slot-picker-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Select Time Slot</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {availableCount} of {slots.length} slots available
        </span>
      </div>

      <div className="slots-grid">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.startTime;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.startTime}
              type="button"
              className={`slot-chip ${
                isSelected ? 'slot-chip-selected' : ''
              } ${!isAvailable ? 'slot-chip-disabled' : ''}`}
              onClick={() => isAvailable && onSelectSlot(slot.startTime)}
              disabled={!isAvailable}
              title={
                isAvailable
                  ? `Book slot ${slot.startTime} - ${slot.endTime}`
                  : 'Slot occupied or unavailable'
              }
            >
              <span className="slot-time-text">{slot.startTime}</span>
              <span className="slot-end-time-sub">to {slot.endTime}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
