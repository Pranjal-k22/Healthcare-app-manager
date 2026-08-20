import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MedicationReminderList } from '../../components/patient/MedicationReminderList';
import {
  FileText,
  HeartPulse,
  Search,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="welcome-title">Welcome, {user?.name}</h1>
          <span className="role-badge badge-patient">
            <UserIcon size={13} /> PATIENT
          </span>
        </div>
        <p className="welcome-subtitle">
          Your personal healthcare dashboard & appointment portal.
        </p>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Active Role</span>
            <HeartPulse size={20} color="var(--primary)" />
          </div>
          <span className="stat-value" style={{ color: 'var(--primary)' }}>
            PATIENT
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Verified Account
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Registered Email</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <span className="stat-value" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            JWT Protected Session
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Doctor Directory</span>
            <Stethoscope size={20} color="#f59e0b" />
          </div>
          <Link to="/patient/doctors" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
            <Search size={14} />
            <span>Search Doctors</span>
          </Link>
        </div>
      </div>

      {/* Medication Reminders Section (Phase 8) */}
      <MedicationReminderList />

      <div className="glass-card info-card">
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} color="var(--primary)" />
          <span>Patient Account Information</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>User ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Full Name</div>
            <div style={{ fontWeight: 600 }}>{user?.name}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Authentication Status</div>
            <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Authenticated (Bearer Token Active)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
