import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctors } from '../../services/doctorApi';
import {
  CheckCircle2,
  PlusCircle,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [doctorCount, setDoctorCount] = useState<number | null>(null);

  useEffect(() => {
    const loadDoctorStats = async () => {
      try {
        const docs = await getDoctors();
        setDoctorCount(docs.length);
      } catch (err) {
        console.warn('Could not fetch doctor count for admin stats', err);
      }
    };
    loadDoctorStats();
  }, []);

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="welcome-title">Welcome, {user?.name}</h1>
            <span className="role-badge badge-admin">
              <ShieldCheck size={13} /> ADMIN
            </span>
          </div>
          <p className="welcome-subtitle">
            Administrative control center & healthcare practitioner management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/doctors" className="btn btn-outline">
            <Users size={16} />
            <span>Doctor Directory</span>
          </Link>
          <Link to="/admin/doctors/create" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Add Doctor</span>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">System Role</span>
            <ShieldAlert size={20} color="#a855f7" />
          </div>
          <span className="stat-value" style={{ color: '#a855f7' }}>
            ADMIN
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Superuser Authority
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Active Doctors</span>
            <Stethoscope size={20} color="#10b981" />
          </div>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {doctorCount !== null ? doctorCount : '—'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configured in System
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Doctor Control</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <Link to="/admin/doctors" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
            <span>Manage Doctors & Leaves</span>
          </Link>
        </div>
      </div>

      <div className="glass-card info-card">
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={20} color="#a855f7" />
          <span>System Security & Doctor Provisioning Controls</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Admin ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Doctor Management</div>
            <div style={{ fontWeight: 600, color: '#10b981' }}>Full Provisioning & Leave Authority</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Phase 2 Status</div>
            <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} />
              Phase 2 Active & Verified
            </div>
          </div>
        </div>

        <div className="phase-roadmap-card" style={{ borderColor: 'rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)' }}>
          <div className="roadmap-title" style={{ color: '#a855f7' }}>
            <Sparkles size={18} />
            <strong>Phase 2 Complete:</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Doctor profiles, weekly hours schedules, slot durations, and practitioner leaves are fully configured. Next in <strong>Phase 3</strong>: Mathematical slot generation engine and double-booking protection.
          </p>
        </div>
      </div>
    </div>
  );
};
