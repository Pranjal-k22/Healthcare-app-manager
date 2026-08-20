import React, { useState, useEffect } from 'react';
import { getMyDoctorProfile } from '../../services/doctorApi';
import { Doctor } from '../../types/doctor';
import { LeaveList } from '../../components/doctor/LeaveList';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Clock,
  Mail,
  Stethoscope,
} from 'lucide-react';

const DAYS_ORDER: Array<{ key: keyof Doctor['workingHours']; label: string }> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const DoctorProfile: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelfProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMyDoctorProfile();
        setDoctor(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your doctor profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelfProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading your clinical profile...
        </p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container dashboard-container">
        <div className="alert alert-error" style={{ marginTop: '2rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Doctor profile not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '900px' }}>
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="welcome-title">My Clinical Profile</h1>
          <span className="role-badge badge-doctor">
            <Stethoscope size={13} /> DOCTOR
          </span>
        </div>
        <p className="welcome-subtitle">
          View your administrative credentials, active consultation schedule, and registered leaves.
        </p>
      </div>

      {/* Practitioner Details Card */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="doctor-avatar" style={{ width: '64px', height: '64px' }}>
            <Stethoscope size={36} color="#10b981" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctor.name}</h2>
              <span className="specialization-badge" style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                {doctor.specialization}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} />
                <span>{doctor.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="var(--primary)" />
                <span>{doctor.slotDuration} min consultation slots</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours Timetable */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={20} color="var(--primary)" />
          <span>Active Consultation Hours</span>
        </h3>

        <div className="schedule-table-card">
          {DAYS_ORDER.map(({ key, label }) => {
            const config = doctor.workingHours[key];
            const isEnabled = config && config.enabled;

            return (
              <div key={key} className="schedule-row">
                <span className="schedule-day-name">{label}</span>
                {isEnabled ? (
                  <span className="schedule-hours-active">
                    {config.start} – {config.end}
                  </span>
                ) : (
                  <span className="schedule-hours-off">Off Duty</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctor Leaves */}
      <div className="glass-card info-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#f59e0b" />
          <span>Registered Leave Days</span>
        </h3>
        <LeaveList leaves={doctor.leaves || []} />
      </div>
    </div>
  );
};
