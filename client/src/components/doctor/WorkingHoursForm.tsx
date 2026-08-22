import React from 'react';
import { WorkingHours } from '../../types/doctor';
import { Clock, Sparkles, Check, Moon, Sun, ArrowRight, AlertCircle, Copy } from 'lucide-react';

const DAYS: Array<{ key: keyof WorkingHours; label: string; short: string }> = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

interface WorkingHoursFormProps {
  workingHours: WorkingHours;
  onChange: (updated: WorkingHours) => void;
}

export const WorkingHoursForm: React.FC<WorkingHoursFormProps> = ({
  workingHours,
  onChange,
}) => {
  const handleToggleDay = (dayKey: keyof WorkingHours) => {
    const current = workingHours[dayKey] || { enabled: false, start: null, end: null };
    const newEnabled = !current.enabled;
    onChange({
      ...workingHours,
      [dayKey]: {
        enabled: newEnabled,
        start: newEnabled ? current.start || '09:00' : null,
        end: newEnabled ? current.end || '17:00' : null,
      },
    });
  };

  const handleTimeChange = (
    dayKey: keyof WorkingHours,
    field: 'start' | 'end',
    value: string
  ) => {
    onChange({
      ...workingHours,
      [dayKey]: {
        ...workingHours[dayKey],
        [field]: value,
      },
    });
  };

  const applyMonFriPreset = () => {
    onChange({
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: null, end: null },
      sunday: { enabled: false, start: null, end: null },
    });
  };

  const applyMonSatPreset = () => {
    onChange({
      monday: { enabled: true, start: '09:00', end: '18:00' },
      tuesday: { enabled: true, start: '09:00', end: '18:00' },
      wednesday: { enabled: true, start: '09:00', end: '18:00' },
      thursday: { enabled: true, start: '09:00', end: '18:00' },
      friday: { enabled: true, start: '09:00', end: '18:00' },
      saturday: { enabled: true, start: '09:00', end: '14:00' },
      sunday: { enabled: false, start: null, end: null },
    });
  };

  const copyMondayToAll = () => {
    const monday = workingHours.monday || { enabled: true, start: '09:00', end: '17:00' };
    if (!monday.enabled || !monday.start || !monday.end) return;

    onChange({
      monday: { ...monday },
      tuesday: { enabled: true, start: monday.start, end: monday.end },
      wednesday: { enabled: true, start: monday.start, end: monday.end },
      thursday: { enabled: true, start: monday.start, end: monday.end },
      friday: { enabled: true, start: monday.start, end: monday.end },
      saturday: { ...workingHours.saturday },
      sunday: { ...workingHours.sunday },
    });
  };

  const calculateHours = (start?: string | null, end?: string | null): string | null => {
    if (!start || !end) return null;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
  };

  const activeDaysCount = Object.values(workingHours).filter((d) => d?.enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Presets & Controls Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.85rem 1.15rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#0062cc',
              color: '#ffffff',
            }}
          >
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Schedule Configuration
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {activeDaysCount} of 7 days active for patient booking
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={applyMonFriPreset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#0062cc',
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 98, 204, 0.06)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#eff6ff')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            <Sparkles size={13} color="#2563eb" /> Standard Mon–Fri
          </button>

          <button
            type="button"
            onClick={applyMonSatPreset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#475569',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            Mon–Sat Clinic
          </button>

          <button
            type="button"
            onClick={copyMondayToAll}
            title="Copy Monday's start & end time to Tue–Fri"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#0f766e',
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#ccfbf1')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f0fdfa')}
          >
            <Copy size={13} /> Apply Mon to Weekdays
          </button>
        </div>
      </div>

      {/* Days List Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {DAYS.map(({ key, label }) => {
          const config = workingHours[key] || { enabled: false, start: null, end: null };
          const isInvalid =
            config.enabled &&
            config.start &&
            config.end &&
            config.start >= config.end;
          const shiftDuration = calculateHours(config.start, config.end);

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.85rem 1.15rem',
                borderRadius: '10px',
                border: config.enabled ? '1.5px solid #93c5fd' : '1px solid #e2e8f0',
                background: config.enabled
                  ? 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)'
                  : '#f8fafc',
                boxShadow: config.enabled
                  ? '0 2px 8px rgba(0, 98, 204, 0.05)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Left Column: Switch + Day Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '160px' }}>
                {/* Modern Switch */}
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => handleToggleDay(key)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: config.enabled ? '#0062cc' : '#cbd5e1',
                      borderRadius: '24px',
                      transition: '0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '18px',
                        width: '18px',
                        left: config.enabled ? '23px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: config.enabled ? 700 : 500,
                      color: config.enabled ? '#0f172a' : '#94a3b8',
                    }}
                  >
                    {label}
                  </span>
                  {config.enabled && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        background: '#e0f2fe',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Time Inputs or Day Off Pill */}
              {config.enabled ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  {/* Start Time Box */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      border: isInvalid ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.3rem 0.65rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#64748b',
                        marginRight: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Sun size={13} color="#f59e0b" /> Start
                    </span>
                    <input
                      type="time"
                      value={config.start || '09:00'}
                      onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      required
                    />
                  </div>

                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={15} />
                  </span>

                  {/* End Time Box */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      border: isInvalid ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.3rem 0.65rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#64748b',
                        marginRight: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Moon size={13} color="#6366f1" /> End
                    </span>
                    <input
                      type="time"
                      value={config.end || '17:00'}
                      onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                      required
                    />
                  </div>

                  {/* Duration Badge or Error Alert */}
                  {isInvalid ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#b91c1c',
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <AlertCircle size={13} /> Start must be before End
                    </span>
                  ) : shiftDuration ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#047857',
                        background: '#d1fae5',
                        padding: '4px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Check size={12} /> {shiftDuration}
                    </span>
                  ) : null}
                </div>
              ) : (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    background: '#f1f5f9',
                    padding: '4px 12px',
                    borderRadius: '6px',
                  }}
                >
                  Day Off (Unavailable)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
