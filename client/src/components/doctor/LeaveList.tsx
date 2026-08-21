import React from 'react';
import { Leave } from '../../types/doctor';
import { CalendarOff, Trash2, Calendar } from 'lucide-react';
import Button from '../ui/Button';

interface LeaveListProps {
  leaves: Leave[];
  onDelete?: (date: string) => void;
  isDeleting?: string | null;
}

export const LeaveList: React.FC<LeaveListProps> = ({
  leaves,
  onDelete,
  isDeleting = null,
}) => {
  if (!leaves || leaves.length === 0) {
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
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
          }}
        >
          <CalendarOff size={22} color="var(--text-muted)" />
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
          No Scheduled Leaves
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
          Doctor is available on all regular working days.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
      {leaves.map((leave) => (
        <div
          key={leave.date}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.15rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                color: '#D97706',
                border: '1px solid var(--warning-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {leave.date}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {leave.reason || 'Approved Leave'}
              </div>
            </div>
          </div>

          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onDelete(leave.date)}
              disabled={isDeleting === leave.date}
              isLoading={isDeleting === leave.date}
              leftIcon={<Trash2 size={13} />}
            >
              Remove
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
