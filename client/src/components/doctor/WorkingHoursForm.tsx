import React from 'react';
import { WorkingHours } from '../../types/doctor';
import { Clock, Sparkles } from 'lucide-react';

const DAYS: Array<{ key: keyof WorkingHours; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
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
    const current = workingHours[dayKey];
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

  const applyAllDaysPreset = () => {
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

  return (
    <div className="working-hours-container">
      <div className="working-hours-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Weekly Working Hours (HH:mm)</h4>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={applyMonFriPreset}
            style={{ fontSize: '0.75rem' }}
          >
            <Sparkles size={12} /> Standard Mon–Fri
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={applyAllDaysPreset}
            style={{ fontSize: '0.75rem' }}
          >
            Mon–Sat
          </button>
        </div>
      </div>

      <div className="days-list">
        {DAYS.map(({ key, label }) => {
          const config = workingHours[key] || { enabled: false, start: null, end: null };
          const isInvalidTime =
            config.enabled &&
            config.start &&
            config.end &&
            config.start >= config.end;

          return (
            <div
              key={key}
              className={`day-row ${config.enabled ? 'day-enabled' : 'day-disabled'}`}
            >
              <div className="day-name-col">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => handleToggleDay(key)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="day-label">{label}</span>
              </div>

              {config.enabled ? (
                <div className="day-times-col">
                  <div className="time-input-group">
                    <span className="time-sublabel">Start:</span>
                    <input
                      type="time"
                      className="form-input time-input"
                      value={config.start || '09:00'}
                      onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                      required
                    />
                  </div>

                  <span style={{ color: 'var(--text-muted)' }}>➔</span>

                  <div className="time-input-group">
                    <span className="time-sublabel">End:</span>
                    <input
                      type="time"
                      className="form-input time-input"
                      value={config.end || '17:00'}
                      onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                      required
                    />
                  </div>

                  {isInvalidTime && (
                    <span className="time-error-pill">
                      Start must be earlier than end
                    </span>
                  )}
                </div>
              ) : (
                <div className="day-off-text">Day Off (Unavailable)</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
