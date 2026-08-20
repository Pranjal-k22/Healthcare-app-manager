import React from 'react';
import { Leave } from '../../types/doctor';
import { CalendarOff, Trash2 } from 'lucide-react';

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
      <div className="empty-leaves-state">
        <CalendarOff size={32} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          No scheduled leaves on record. Doctor is available on normal working days.
        </p>
      </div>
    );
  }

  return (
    <div className="leave-list-grid">
      {leaves.map((leave) => (
        <div key={leave.date} className="glass-card leave-item-card">
          <div className="leave-info">
            <span className="leave-date-badge">{leave.date}</span>
            <span className="leave-reason-text">
              {leave.reason || 'Personal Leave'}
            </span>
          </div>

          {onDelete && (
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={() => onDelete(leave.date)}
              disabled={isDeleting === leave.date}
              title="Remove this scheduled leave"
            >
              <Trash2 size={14} />
              <span>{isDeleting === leave.date ? 'Removing...' : 'Remove'}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
