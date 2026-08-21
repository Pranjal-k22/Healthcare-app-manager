import React from 'react';
import { AvailableSlot } from '../../types/appointment';
import { Clock, Ban, CheckCircle2 } from 'lucide-react';

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
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border)',
        }}
      >
        <div
          className="btn-spinner"
          style={{
            width: '28px',
            height: '28px',
            margin: '0 auto 0.75rem auto',
            borderColor: 'var(--primary)',
            borderTopColor: 'transparent',
          }}
        />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Calculating available consultation slots...
        </p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <Ban size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.925rem', margin: '0 0 0.25rem 0' }}>
          No Slots Available
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          No consultation slots available on this date. Doctor may be off duty, on leave, or fully booked.
        </p>
      </div>
    );
  }

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Clock size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Select Time Slot
          </span>
        </div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: availableCount > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: availableCount > 0 ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${availableCount > 0 ? 'var(--success-border)' : 'var(--danger-border)'}`,
          }}
        >
          {availableCount} of {slots.length} slots available
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.65rem',
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '2px',
        }}
      >
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot.startTime;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.startTime}
              type="button"
              className={`slot-chip-btn ${isSelected ? 'slot-chip-active' : ''} ${
                !isAvailable ? 'slot-chip-unavailable' : ''
              }`}
              onClick={() => isAvailable && onSelectSlot(slot.startTime)}
              disabled={!isAvailable}
              title={
                isAvailable
                  ? `Book slot ${slot.startTime} – ${slot.endTime}`
                  : 'Slot already booked or unavailable'
              }
            >
              <span className="slot-chip-time">{slot.startTime}</span>
              <span className="slot-chip-end">to {slot.endTime}</span>
              {isSelected && (
                <CheckCircle2
                  size={14}
                  style={{ position: 'absolute', top: '6px', right: '6px' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
