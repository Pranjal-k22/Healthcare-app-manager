import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, updateDoctor } from '../../services/doctorApi';
import { WorkingHours } from '../../types/doctor';
import { WorkingHoursForm } from '../../components/doctor/WorkingHoursForm';
import {
  AlertCircle,
  ArrowLeft,
  Save,
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
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading doctor configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <h1 className="welcome-title" style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          Edit Doctor Configuration
        </h1>
        <p className="welcome-subtitle">
          Update practitioner details, qualifications, consultation fee, clinic, and weekly availability schedule.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card form-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--primary)" />
          <span>Practitioner Information</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="editDocName">
              Full Name *
            </label>
            <input
              id="editDocName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDocEmail">
              Email Address (Read-only)
            </label>
            <input
              id="editDocEmail"
              type="email"
              className="form-input"
              value={email}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="editDocSpec">
              Specialization *
            </label>
            <input
              id="editDocSpec"
              type="text"
              className="form-input"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDocQual">
              Qualifications (comma-separated)
            </label>
            <input
              id="editDocQual"
              type="text"
              className="form-input"
              value={qualificationsStr}
              onChange={(e) => setQualificationsStr(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="editDocExp">
              Experience (Years)
            </label>
            <input
              id="editDocExp"
              type="number"
              min={0}
              className="form-input"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDocFee">
              Consultation Fee ($)
            </label>
            <input
              id="editDocFee"
              type="number"
              min={0}
              className="form-input"
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDocSlotDuration">
              Slot Duration
            </label>
            <select
              id="editDocSlotDuration"
              className="form-input"
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="editClinicName">
              Clinic / Hospital Name
            </label>
            <input
              id="editClinicName"
              type="text"
              className="form-input"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="editDocPhone">
              Phone Number
            </label>
            <input
              id="editDocPhone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="editClinicAddress">
            Clinic Address
          </label>
          <input
            id="editClinicAddress"
            type="text"
            className="form-input"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="editDocBio">
            Professional Biography
          </label>
          <textarea
            id="editDocBio"
            className="form-input"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={2000}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            id="editDocAvail"
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="editDocAvail" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
            Doctor is actively taking consultations (Available Status)
          </label>
        </div>

        {workingHours && (
          <div style={{ margin: '2rem 0' }}>
            <WorkingHoursForm
              workingHours={workingHours}
              onChange={setWorkingHours}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/admin/doctors" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
