import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Clock,
  FileCheck,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="welcome-title">Welcome, Dr. {user?.name}</h1>
          <span className="role-badge badge-doctor">
            <Stethoscope size={13} /> DOCTOR
          </span>
        </div>
        <p className="welcome-subtitle">
          Doctor consultation portal & patient management terminal.
        </p>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">System Role</span>
            <Stethoscope size={20} color="#10b981" />
          </div>
          <span className="stat-value" style={{ color: '#10b981' }}>
            DOCTOR
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Clinical Privilege Granted
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Doctor Email</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <span className="stat-value" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Verified Provider Account
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">My Schedule</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <Link to="/doctor/profile" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
            <UserCheck size={14} />
            <span>View My Profile</span>
          </Link>
        </div>
      </div>

      <div className="glass-card info-card">
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={20} color="#10b981" />
          <span>Doctor Profile Details</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Doctor ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Practitioner Name</div>
            <div style={{ fontWeight: 600 }}>Dr. {user?.name}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Authorization Status</div>
            <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              DOCTOR Role Verified (RBAC)
            </div>
          </div>
        </div>

        <div className="phase-roadmap-card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="roadmap-title" style={{ color: '#10b981' }}>
            <Sparkles size={18} />
            <strong>Phase 2 Active:</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your doctor profile, weekly hours, and scheduled leaves are active. In <strong>Phase 3</strong>, patients will be able to book available slots during your active working hours.
          </p>
        </div>
      </div>
    </div>
  );
};
