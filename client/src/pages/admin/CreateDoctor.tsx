import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createDoctor } from '../../services/doctorApi';
import { WorkingHours } from '../../types/doctor';
import { WorkingHoursForm } from '../../components/doctor/WorkingHoursForm';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: null, end: null },
  sunday: { enabled: false, start: null, end: null },
};

export const CreateDoctor: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password || !specialization.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createDoctor({
        name: name.trim(),
        email: email.trim(),
        password,
        specialization: specialization.trim(),
        slotDuration,
        workingHours,
      });

      navigate('/admin/doctors', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container dashboard-container" style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <h1 className="welcome-title" style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>
          Create Doctor Profile
        </h1>
        <p className="welcome-subtitle">
          Provision a verified DOCTOR user account, set clinical specialization, and define weekly consultation hours.
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
          <span>Practitioner Credentials</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="docName">
              Full Name *
            </label>
            <input
              id="docName"
              type="text"
              className="form-input"
              placeholder="e.g. Dr. Emily Thorne"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="docEmail">
              Email Address *
            </label>
            <input
              id="docEmail"
              type="email"
              className="form-input"
              placeholder="emily.thorne@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="docPassword">
              Temporary Password *
            </label>
            <input
              id="docPassword"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="docSpec">
              Specialization *
            </label>
            <input
              id="docSpec"
              type="text"
              className="form-input"
              placeholder="e.g. Cardiology, Dermatology"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label" htmlFor="docSlotDuration">
            Appointment Slot Duration
          </label>
          <select
            id="docSlotDuration"
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

        <div style={{ margin: '2rem 0' }}>
          <WorkingHoursForm
            workingHours={workingHours}
            onChange={setWorkingHours}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/admin/doctors" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Creating Doctor...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Create Doctor Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
