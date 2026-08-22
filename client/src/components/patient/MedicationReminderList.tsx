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
  Calendar,
  Sparkles,
  RefreshCw,
  BellRing,
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
      setActionSuccess('Dose recorded as taken successfully!');
      setTimeout(() => setActionSuccess(null), 4000);
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
      setActionSuccess('Dose recorded as skipped.');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#047857',
              background: '#d1fae5',
              border: '1px solid #a7f3d0',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            <CheckCircle2 size={12} /> Taken
          </span>
        );
      case 'SENT':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#1d4ed8',
              background: '#dbeafe',
              border: '1px solid #bfdbfe',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            <BellRing size={12} /> Due Now
          </span>
        );
      case 'PENDING':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#475569',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            <Clock size={12} /> Scheduled
          </span>
        );
      case 'MISSED':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#b91c1c',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              padding: '3px 8px',
              borderRadius: '6px',
            }}
          >
            <XCircle size={12} /> Missed
          </span>
        );
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        padding: '1.5rem',
        marginBottom: '1.75rem',
        overflow: 'hidden',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.35rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
            }}
          >
            <Pill size={22} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.18rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Prescribed Medication Reminders
            </h3>
            <span
              style={{
                fontSize: '0.84rem',
                color: '#64748b',
                display: 'block',
                marginTop: '2px',
              }}
            >
              Structured dose schedule derived from your doctor's prescriptions
            </span>
          </div>
        </div>

        {/* Modern Segmented Tab Bar */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('today')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              fontWeight: tab === 'today' ? 700 : 600,
              color: tab === 'today' ? '#0062cc' : '#64748b',
              background: tab === 'today' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: tab === 'today' ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={13} />
            Today's Doses
          </button>

          <button
            type="button"
            onClick={() => setTab('upcoming')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              fontWeight: tab === 'upcoming' ? 700 : 600,
              color: tab === 'upcoming' ? '#0062cc' : '#64748b',
              background: tab === 'upcoming' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: tab === 'upcoming' ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={13} />
            Upcoming
          </button>

          <button
            type="button"
            onClick={() => setTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.95rem',
              fontSize: '0.84rem',
              fontWeight: tab === 'history' ? 700 : 600,
              color: tab === 'history' ? '#0062cc' : '#64748b',
              background: tab === 'history' ? '#ffffff' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: tab === 'history' ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={13} />
            History
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#0062cc',
              borderRadius: '50%',
              margin: '0 auto 0.75rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
            Updating dose schedule...
          </span>
        </div>
      ) : reminders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '1rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
            }}
          >
            <Pill size={28} />
          </div>
          <h4
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 0.4rem',
            }}
          >
            {tab === 'today'
              ? 'No Doses Scheduled for Today'
              : tab === 'upcoming'
              ? 'No Upcoming Doses Found'
              : 'No Medication History Yet'}
          </h4>
          <p
            style={{
              fontSize: '0.86rem',
              color: '#64748b',
              maxWidth: '420px',
              margin: '0 auto',
              lineHeight: '1.45',
            }}
          >
            {tab === 'today'
              ? 'You are all caught up! Once your doctor writes a prescription with structured daily dosages, reminders will automatically appear here.'
              : tab === 'upcoming'
              ? 'Future medicine schedules from your physician consultations will be queued here.'
              : 'Past recorded doses (taken and skipped) will be logged here for clinical adherence audits.'}
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
                padding: '1rem 1.25rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                {/* Time Badge */}
                <div
                  style={{
                    textAlign: 'center',
                    minWidth: '80px',
                    padding: '0.5rem 0.65rem',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#0062cc',
                      display: 'block',
                    }}
                  >
                    {reminder.scheduledTime}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    {reminder.scheduledDate}
                  </span>
                </div>

                {/* Medicine & Instructions Info */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {reminder.medicineName}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        color: '#475569',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      {reminder.dosage}
                    </span>
                    {getStatusBadge(reminder.status)}
                  </div>
                  {reminder.instructions && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#64748b',
                        marginTop: '0.25rem',
                        marginBottom: 0,
                      }}
                    >
                      {reminder.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons for Pending / Due Now Doses */}
              {['PENDING', 'SENT'].includes(reminder.status) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleMarkTaken(reminder.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Check size={14} />
                    <span>Take Dose</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkSkipped(reminder.id)}
                    title="Mark this dose as skipped"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#64748b',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
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
