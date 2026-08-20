import React, { useState, useEffect } from 'react';
import {
  getTodayReminders,
  getUpcomingReminders,
  getReminderHistory,
  markReminderTaken,
  markReminderSkipped,
} from '../../services/medicationReminderApi';
import { MedicationReminderItem } from '../../types/medicationReminder';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Pill,
  X,
  XCircle,
} from 'lucide-react';

export const MedicationReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<MedicationReminderItem[]>([]);
  const [tab, setTab] = useState<'today' | 'upcoming' | 'history'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let data: MedicationReminderItem[] = [];

      if (tab === 'today') {
        data = await getTodayReminders();
      } else if (tab === 'upcoming') {
        data = await getUpcomingReminders();
      } else {
        data = await getReminderHistory();
      }

      setReminders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load medication reminders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [tab]);

  const handleMarkTaken = async (id: string) => {
    try {
      setActionSuccess(null);
      const updated = await markReminderTaken(id);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      setActionSuccess('Medication marked as taken!');
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder.');
    }
  };

  const handleMarkSkipped = async (id: string) => {
    try {
      setActionSuccess(null);
      const updated = await markReminderSkipped(id);
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
      setActionSuccess('Medication marked as skipped.');
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> Taken
          </span>
        );
      case 'SENT':
        return (
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Due Now
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Scheduled
          </span>
        );
      case 'MISSED':
      default:
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <XCircle size={12} /> Missed
          </span>
        );
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="calendar-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.25)' }}>
            <Pill size={22} color="#a855f7" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Prescribed Medication Reminders
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Structured dose schedule derived from your doctor's prescriptions
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'today' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('today')}
          >
            Today's Doses
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'history' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('history')}
          >
            History
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={15} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto' }} />
        </div>
      ) : reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
          <Pill size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.9rem' }}>
            {tab === 'today'
              ? 'No medication doses scheduled for today.'
              : tab === 'upcoming'
              ? 'No upcoming doses scheduled.'
              : 'No medication reminder history found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.9rem 1.25rem',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'center', minWidth: '70px', paddingRight: '0.75rem', borderRight: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', display: 'block' }}>
                    {reminder.scheduledTime}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {reminder.scheduledDate}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {reminder.medicineName}
                    </strong>
                    <span className="rx-dosage-badge" style={{ fontSize: '0.75rem' }}>
                      {reminder.dosage}
                    </span>
                    {getStatusBadge(reminder.status)}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {reminder.instructions}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Pending/Sent Reminders */}
              {['PENDING', 'SENT'].includes(reminder.status) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => handleMarkTaken(reminder.id)}
                  >
                    <Check size={14} />
                    <span>Take Dose</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                    onClick={() => handleMarkSkipped(reminder.id)}
                    title="Skip dose"
                  >
                    <X size={14} />
                    <span>Skip</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
