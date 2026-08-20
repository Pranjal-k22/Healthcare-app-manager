import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../../services/doctorApi';
import { Doctor } from '../../types/doctor';
import { LeaveList } from '../../components/doctor/LeaveList';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Building,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  Mail,
  Phone,
  Sparkles,
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

export const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await getDoctorById(id);
        setDoctor(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load doctor profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading practitioner profile...
        </p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container dashboard-container">
        <Link to="/patient/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Search</span>
        </Link>
        <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Doctor profile not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Search</span>
        </Link>
      </div>

      {/* Doctor Header Card */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="doctor-avatar" style={{ width: '68px', height: '68px' }}>
            <Stethoscope size={36} color="#10b981" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{doctor.name}</h1>
                <span className="specialization-badge" style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                  {doctor.specialization}
                </span>
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <span className="qualification-badge">
                    {doctor.qualifications.join(', ')}
                  </span>
                )}
              </div>

              {doctor.isAvailable ? (
                <span className="status-pill status-pill-active">Available</span>
              ) : (
                <span className="status-pill status-pill-unavailable">Unavailable</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} />
                <span>{doctor.email}</span>
              </div>
              {doctor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={15} />
                  <span>{doctor.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={15} color="var(--accent-teal)" />
                <span>{doctor.experienceYears || 0} yrs experience</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
                <DollarSign size={15} />
                <span>${doctor.consultationFee || 0} / visit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="var(--primary)" />
                <span>{doctor.slotDuration} min consultation slots</span>
              </div>
            </div>

            {doctor.clinicName && (
              <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={15} />
                <span>
                  {doctor.clinicName}
                  {doctor.clinicAddress ? ` — ${doctor.clinicAddress}` : ''}
                </span>
              </div>
            )}

            {doctor.bio && (
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                {doctor.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Working Hours Schedule */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={20} color="var(--primary)" />
          <span>Weekly Consultation Schedule</span>
        </h2>

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
                  <span className="schedule-hours-off">Unavailable / Off</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Scheduled Leaves */}
      <div className="glass-card info-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#f59e0b" />
          <span>Upcoming Practitioner Leaves</span>
        </h2>
        <LeaveList leaves={doctor.leaves || []} />
      </div>

      {/* Booking Action */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--primary-glow)', background: 'rgba(14, 165, 233, 0.06)' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span>Ready to book a consultation?</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Select an available date and choose your preferred time slot with real-time double-booking protection.
          </p>
        </div>
        <Link to={`/patient/book/${doctor.id}`} className="btn btn-primary">
          <Calendar size={16} />
          <span>Book Appointment</span>
        </Link>
      </div>
    </div>
  );
};
