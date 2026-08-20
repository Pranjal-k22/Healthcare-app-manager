import React, { useState, useEffect } from 'react';
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
} from '../../services/doctorApi';
import { Doctor } from '../../types/doctor';
import { LeaveList } from '../../components/doctor/LeaveList';
import {
  AlertCircle,
  Award,
  Building,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  Mail,
  Phone,
  Save,
  Stethoscope,
  X,
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
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading your clinical profile...
        </p>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="container dashboard-container">
        <div className="alert alert-error" style={{ marginTop: '2rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Doctor profile not found.'}</span>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="container dashboard-container" style={{ maxWidth: '900px' }}>
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="welcome-title">My Clinical Profile</h1>
            <span className="role-badge badge-doctor">
              <Stethoscope size={13} /> DOCTOR
            </span>
          </div>
          <p className="welcome-subtitle">
            Manage your credentials, professional biography, consultation fee, and schedule availability.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setIsEditing(true);
              setSuccessMsg(null);
            }}
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="glass-card form-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Clinical Profile</h3>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditing(false)}
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="selfName">
                Full Name
              </label>
              <input
                id="selfName"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selfSpec">
                Specialization
              </label>
              <input
                id="selfSpec"
                type="text"
                className="form-input"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="selfQual">
                Qualifications
              </label>
              <input
                id="selfQual"
                type="text"
                className="form-input"
                value={qualificationsStr}
                onChange={(e) => setQualificationsStr(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selfExp">
                Experience (Years)
              </label>
              <input
                id="selfExp"
                type="number"
                min={0}
                className="form-input"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selfFee">
                Consultation Fee ($)
              </label>
              <input
                id="selfFee"
                type="number"
                min={0}
                className="form-input"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="selfClinic">
                Clinic / Hospital Name
              </label>
              <input
                id="selfClinic"
                type="text"
                className="form-input"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="selfPhone">
                Contact Phone
              </label>
              <input
                id="selfPhone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="selfAddress">
              Clinic Address
            </label>
            <input
              id="selfAddress"
              type="text"
              className="form-input"
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="selfBio">
              Professional Biography
            </label>
            <textarea
              id="selfBio"
              className="form-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              id="selfAvail"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="selfAvail" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
              Currently accepting new patient appointments (Available Status)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="spinner" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Practitioner Details Display */
        <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="doctor-avatar" style={{ width: '68px', height: '68px' }}>
              <Stethoscope size={36} color="#10b981" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{doctor.name}</h2>
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
                  <span>{doctor.experienceYears || 0} years experience</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
                  <DollarSign size={15} />
                  <span>${doctor.consultationFee || 0} consultation fee</span>
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
      )}

      {/* Working Hours Timetable */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={20} color="var(--primary)" />
            <span>Active Consultation Hours</span>
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {doctor.slotDuration} min consultation slots
          </span>
        </div>

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
