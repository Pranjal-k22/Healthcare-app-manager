import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, updateDoctor, deleteDoctor } from '../../services/doctorApi';
import { WorkingHours } from '../../types/doctor';
import { WorkingHoursForm } from '../../components/doctor/WorkingHoursForm';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Save,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
} from 'lucide-react';


export const EditDoctor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualificationsStr, setQualificationsStr] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [isAvailable, setIsAvailable] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const doctor = await getDoctorById(id);
        setName(doctor.name);
        setEmail(doctor.email);
        setSpecialization(doctor.specialization);
        setQualificationsStr(
          doctor.qualifications ? doctor.qualifications.join(', ') : 'MBBS'
        );
        setExperienceYears(doctor.experienceYears || 0);
        setConsultationFee(doctor.consultationFee || 0);
        setClinicName(doctor.clinicName || '');
        setClinicAddress(doctor.clinicAddress || '');
        setPhone(doctor.phone || '');
        setBio(doctor.bio || '');
        setSlotDuration(doctor.slotDuration || 30);
        setIsAvailable(doctor.isAvailable !== false);
        setWorkingHours(doctor.workingHours);
      } catch (err: any) {
        setError(err.message || 'Failed to load doctor details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !workingHours) return;

    setError(null);
    if (!name.trim() || !specialization.trim()) {
      setError('Please provide doctor name and specialization.');
      return;
    }

    const qualificationsArray = qualificationsStr
      .split(',')
      .map((q) => q.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await updateDoctor(id, {
        name: name.trim(),
        specialization: specialization.trim(),
        qualifications: qualificationsArray,
        experienceYears: Number(experienceYears) || 0,
        consultationFee: Number(consultationFee) || 0,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        slotDuration,
        isAvailable,
        workingHours,
      });

      navigate('/admin/doctors', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update doctor profile.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      `⚠️ PERMANENT ACTION\n\nYou are about to permanently delete Dr. ${name} from the system.\n\nThis will:\n• Delete their user account\n• Cancel all active appointments\n• Remove all leave records\n\nThis action CANNOT be undone. Type OK to confirm.`
    );
    if (!confirmed) return;

    try {
      setIsDeletingDoctor(true);
      setDeleteError(null);
      await deleteDoctor(id);
      navigate('/admin/doctors', { replace: true });
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete doctor. Please try again.'
      );
    } finally {
      setIsDeletingDoctor(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading practitioner profile..." />;
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '920px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/admin/doctors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#0062cc',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Edit Practitioner Profile
          </h1>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(96, 165, 250, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(96, 165, 250, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ShieldCheck size={12} /> Admin Directory
          </span>
        </div>
        <p className="helper-text" style={{ fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
          Modify doctor professional qualifications, consultation pricing, slot durations, and working hours.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="var(--danger)" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Account & Credentials */}
        <div className="card-ui" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              1. Account Identity
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-input-ui"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                className="form-input-ui"
                value={email}
                disabled
                style={{ background: 'var(--surface-secondary)', color: 'var(--text-muted)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Medical Specialization *
              </label>
              <input
                type="text"
                className="form-input-ui"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                className="form-input-ui"
                value={qualificationsStr}
                onChange={(e) => setQualificationsStr(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Details & Fees */}
        <div className="card-ui" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Stethoscope size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              2. Consultation Pricing & Duration Settings
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                min={0}
                className="form-input-ui"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Consultation Fee ($)
              </label>
              <input
                type="number"
                min={0}
                className="form-input-ui"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Slot Duration (Minutes)
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff' }}
              >
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Clinic / Hospital Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Clinic Address
            </label>
            <input
              type="text"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              id="editAvail"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="editAvail" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Practitioner is currently active and accepting bookings (Available)
            </label>
          </div>
        </div>

        {/* Section 3: Working Hours Schedule */}
        {workingHours && (
          <div
            style={{
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Clock size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                3. Active Consultation Hours & Schedule
              </h3>
            </div>

            <WorkingHoursForm
              workingHours={workingHours}
              onChange={(updated) => setWorkingHours(updated)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <Link
            to="/admin/doctors"
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.92rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.75rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0062cc, #0052ad)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0, 98, 204, 0.25)',
            }}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div
        style={{
          marginTop: '0.5rem',
          padding: '1.5rem',
          background: '#fff5f5',
          borderRadius: '14px',
          border: '1.5px solid #fecaca',
          boxShadow: '0 4px 16px rgba(220, 38, 38, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertTriangle size={18} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b91c1c', margin: 0 }}>Danger Zone</h3>
        </div>
        <p style={{ color: '#7f1d1d', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Permanently remove <strong>Dr. {name}</strong> from the system. This will delete their user
          account, cancel all pending/booked appointments, and erase all leave records.
          <strong> This action cannot be undone.</strong>
        </p>

        {deleteError && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{deleteError}</span>
          </div>
        )}

        <button
          type="button"
          id="btn-delete-doctor"
          onClick={handleDeleteDoctor}
          disabled={isDeletingDoctor || isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: '1.5px solid #dc2626',
            background: isDeletingDoctor ? '#fca5a5' : '#dc2626',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: isDeletingDoctor ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <Trash2 size={15} />
          <span>{isDeletingDoctor ? 'Deleting Doctor...' : 'Permanently Delete Doctor'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditDoctor;
