import React, { useState, useEffect } from 'react';
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from '../../services/doctorApi';
import { changePasswordApi } from '../../services/authApi';
import { Doctor } from '../../types/doctor';
import {
  AlertCircle,
  Award,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Edit3,
  Mail,
  Phone,
  X,
  Clock,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

import { CalendarSettingsCard } from '../../components/calendar/CalendarSettingsCard';
import { DoctorLeaveManager } from '../../components/doctor/DoctorLeaveManager';
import Avatar from '../../components/ui/Avatar';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualificationsStr, setQualificationsStr] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please enter both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordUpdating(true);
      const res = await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password changed successfully! A security confirmation was sent to your email.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const fetchSelfProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyDoctorProfile();
      setDoctor(data);
      setName(data.name);
      setSpecialization(data.specialization);
      setQualificationsStr(
        data.qualifications ? data.qualifications.join(', ') : 'MBBS'
      );
      setExperienceYears(data.experienceYears || 0);
      setConsultationFee(data.consultationFee || 0);
      setClinicName(data.clinicName || '');
      setClinicAddress(data.clinicAddress || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setIsAvailable(data.isAvailable !== false);
    } catch (err: any) {
      setError(err.message || 'Failed to load your doctor profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSelfProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      const qualificationsArray = qualificationsStr
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      const updated = await updateMyDoctorProfile({
        name: name.trim(),
        specialization: specialization.trim(),
        qualifications: qualificationsArray,
        experienceYears: Number(experienceYears) || 0,
        consultationFee: Number(consultationFee) || 0,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        isAvailable,
      });

      setDoctor(updated);
      setIsEditing(false);
      setSuccessMsg('Your clinical profile has been updated successfully.');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update profile.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontWeight: 500 }}>
          Loading your clinical profile...
        </p>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="container dashboard-container" style={{ maxWidth: '960px', padding: '2rem 1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Doctor profile not found.'}</span>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="container dashboard-container" style={{ maxWidth: '980px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              My Clinical Profile
            </h1>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#0062cc', border: '1px solid #bfdbfe' }}>
              DOCTOR
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Manage your credentials, professional biography, consultation fee, and schedule availability.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: '1.5px solid #0062cc',
              background: '#ffffff',
              color: '#0062cc',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 98, 204, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        /* Edit Profile Form */
        <form
          onSubmit={handleSaveProfile}
          style={{
            marginBottom: '1.75rem',
            padding: '1.75rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Edit Practitioner Credentials & Settings
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Qualifications (comma-separated)
              </label>
              <input
                type="text"
                value={qualificationsStr}
                onChange={(e) => setQualificationsStr(e.target.value)}
                placeholder="e.g. MBBS, MD (Cardiology), FACC"
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Professional Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <input
              id="selfAvail"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="selfAvail" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
              Currently accepting patient bookings (Available)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#0062cc',
                color: '#ffffff',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Practitioner Details Display */
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1.75rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Avatar
              name={doctor.name}
              seed={doctor.id || doctor.email}
              src={doctor.profileImage}
              size="xl"
            />

            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {doctor.name}
                    </h2>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        background: '#eff6ff',
                        color: '#0062cc',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {doctor.specialization}
                    </span>
                    {doctor.qualifications && doctor.qualifications.length > 0 && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {doctor.qualifications.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {doctor.isAvailable ? (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                    ● Available for Consultations
                  </span>
                ) : (
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                    ● Off Duty / Unavailable
                  </span>
                )}
              </div>

              {/* Badges / Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.85rem', color: '#64748b', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} color="#94a3b8" />
                  <span>{doctor.email}</span>
                </div>
                {doctor.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={15} color="#94a3b8" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={15} color="#0062cc" />
                  <span>{doctor.experienceYears || 0} years experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 700 }}>
                  <DollarSign size={15} />
                  <span>${doctor.consultationFee || 0} consultation fee</span>
                </div>
              </div>

              {doctor.clinicName && (
                <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={15} color="#94a3b8" />
                  <span>
                    <strong>{doctor.clinicName}</strong>
                    {doctor.clinicAddress ? ` — ${doctor.clinicAddress}` : ''}
                  </span>
                </div>
              )}

              {doctor.bio && (
                <p style={{ marginTop: '1rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', margin: '0.85rem 0 0' }}>
                  {doctor.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Consultation Hours Timetable */}
      <div
        style={{
          marginBottom: '1.75rem',
          padding: '1.75rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 98, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
              <CalendarDays size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Active Consultation Hours
            </h3>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0062cc', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
            {doctor.slotDuration} min consultation slots
          </span>
        </div>

        {/* Timetable Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
          {DAYS_ORDER.map(({ key, label }) => {
            const config = doctor.workingHours[key];
            const isEnabled = config && config.enabled;

            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  background: isEnabled ? '#ffffff' : '#f8fafc',
                  border: isEnabled ? '1px solid #e2e8f0' : '1px dashed #e2e8f0',
                  boxShadow: isEnabled ? '0 1px 4px rgba(15, 23, 42, 0.03)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} color={isEnabled ? '#0062cc' : '#94a3b8'} />
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isEnabled ? '#1e293b' : '#94a3b8' }}>
                    {label}
                  </span>
                </div>

                {isEnabled ? (
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {config.start} – {config.end}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#94a3b8',
                      background: '#f1f5f9',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                    }}
                  >
                    Off Duty
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Calendar Synchronization */}
      <div style={{ marginBottom: '1.75rem' }}>
        <CalendarSettingsCard />
      </div>

      {/* Doctor Leave Management */}
      <div
        style={{
          padding: '1.75rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Calendar size={18} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Leave & Absence Management
          </h3>
        </div>
        <DoctorLeaveManager />
      </div>

      {/* Security & Password Change */}
      <div
        style={{
          padding: '1.75rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <Lock size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Account Security & Password
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Update your account password. If you were recently provisioned, update your temporary password here.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Current / Temporary Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordUpdating}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: passwordUpdating ? 'not-allowed' : 'pointer',
              opacity: passwordUpdating ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <KeyRound size={15} />
            <span>{passwordUpdating ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
