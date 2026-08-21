import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, updateDoctor } from '../../services/doctorApi';
import { WorkingHours } from '../../types/doctor';
import { WorkingHoursForm } from '../../components/doctor/WorkingHoursForm';
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Save,
  ShieldCheck,
  Stethoscope,
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

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', borderWidth: '3px' }} />
        <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 500 }}>
          Loading practitioner profile...
        </p>
      </div>
    );
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Edit Practitioner Profile
          </h1>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              background: '#eff6ff',
              color: '#0062cc',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <ShieldCheck size={12} /> Admin Directory
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
          Modify doctor professional qualifications, consultation pricing, slot durations, and working hours.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Account & Credentials */}
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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
              <User size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              1. Account Identity
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Medical Specialization *
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                value={qualificationsStr}
                onChange={(e) => setQualificationsStr(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Details & Fees */}
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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <Stethoscope size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              2. Consultation Pricing & Duration Settings
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Experience (Years)
              </label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Consultation Fee ($)
              </label>
              <input
                type="number"
                min={0}
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
    </div>
  );
};

export default EditDoctor;
