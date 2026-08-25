import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../../services/doctorApi';
import { Doctor } from '../../types/doctor';
import { LeaveList } from '../../components/doctor/LeaveList';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';
import { SkeletonProfile } from '../../components/ui/Skeleton';
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
  ShieldCheck,
  CheckCircle2,
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
      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container" style={{ maxWidth: '900px', padding: '2rem 1.5rem' }}>
        <Link
          to="/patient/doctors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <div className="alert-inline alert-inline-error">
          <AlertCircle size={18} />
          <span>{error || 'Doctor profile not found'}</span>
        </div>
      </div>
    );
  }

  const cleanName = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;

  return (
    <div className="container" style={{ maxWidth: '960px', padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Back Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/patient/doctors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'gap 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Doctor Search</span>
        </Link>
      </div>

      {/* Hero Profile Card */}
      <Card style={{ padding: '2rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.75rem', flexWrap: 'wrap' }}>
          {/* Avatar Icon */}
          <Avatar
            name={doctor.name}
            seed={doctor.id || doctor.email}
            src={doctor.profileImage}
            size="xl"
          />

          {/* Profile Main Info */}
          <div style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                  {cleanName}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(0, 98, 204, 0.1)',
                      color: 'var(--primary)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                    }}
                  >
                    {doctor.specialization}
                  </span>
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <span
                      style={{
                        background: 'var(--surface-alt)',
                        color: 'var(--text-secondary)',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8125rem',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {doctor.qualifications.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <StatusBadge
                  status={doctor.isAvailable ? 'AVAILABLE' : 'OFF_DUTY'}
                  label={doctor.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
                />
              </div>
            </div>

            {/* Quick Metadata Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginTop: '1rem',
                padding: '0.85rem 1.15rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="var(--primary)" />
                <span>{doctor.email}</span>
              </div>
              {doctor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={15} color="var(--primary)" />
                  <span>{doctor.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={15} color="var(--primary)" />
                <span><strong>{doctor.experienceYears || 0} yrs</strong> experience</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} color="var(--primary)" />
                <span><strong>{doctor.slotDuration || 30} min</strong> slots</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#059669',
                  fontWeight: 700,
                  marginLeft: 'auto',
                }}
              >
                <DollarSign size={16} />
                <span>${doctor.consultationFee || 75} / consultation</span>
              </div>
            </div>

            {/* Clinic Address */}
            {doctor.clinicName && (
              <div
                style={{
                  marginTop: '0.85rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <Building size={15} color="var(--text-muted)" />
                <span>
                  <strong>{doctor.clinicName}</strong>
                  {doctor.clinicAddress ? ` — ${doctor.clinicAddress}` : ''}
                </span>
              </div>
            )}

            {/* Biography */}
            {doctor.bio && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  borderLeft: '3px solid var(--primary)',
                  background: 'rgba(0, 98, 204, 0.03)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                }}
              >
                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {doctor.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Weekly Working Hours Card */}
      <Card style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 98, 204, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarDays size={18} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Weekly Consultation Schedule
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Standard operating hours and available consultation shifts.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {DAYS_ORDER.map(({ key, label }) => {
            const config = doctor.workingHours[key];
            const isEnabled = config && config.enabled;

            return (
              <div
                key={key}
                style={{
                  padding: '0.85rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: isEnabled ? '1px solid var(--border)' : '1px dashed var(--border-light)',
                  background: isEnabled ? 'var(--white)' : 'var(--surface)',
                  textAlign: 'center',
                  boxShadow: isEnabled ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: isEnabled ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  {label}
                </div>

                {isEnabled ? (
                  <div
                    style={{
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      background: 'rgba(0, 98, 204, 0.08)',
                      padding: '3px 6px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-block',
                    }}
                  >
                    {config.start} – {config.end}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Off Duty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Scheduled Leaves */}
      <Card style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={18} color="#D97706" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Upcoming Practitioner Leaves
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Confirmed out-of-office periods and leave records.
            </p>
          </div>
        </div>

        <LeaveList leaves={doctor.leaves || []} />
      </Card>

      {/* Booking Callout Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(57, 49, 175, 0.04) 0%, rgba(0, 198, 255, 0.06) 100%)',
          border: '1.5px solid rgba(0, 98, 204, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Ready to schedule your visit?
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
            Book in real-time with verified slot availability, AI pre-visit questionnaire, and automated Google Calendar synchronization.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#10B981" />
              <span>Real-Time Collision Protection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Instant Confirmation Email</span>
            </div>
          </div>
        </div>

        <div>
          <Link to={`/patient/book/${doctor.id}`} style={{ textDecoration: 'none' }}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Calendar size={18} />}
            >
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
