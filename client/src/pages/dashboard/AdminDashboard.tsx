import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  CheckCircle2,
  KeyRound,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 className="welcome-title">Welcome, {user?.name}</h1>
          <span className="role-badge badge-admin">
            <ShieldCheck size={13} /> ADMIN
          </span>
        </div>
        <p className="welcome-subtitle">
          Administrative control center & healthcare system management.
        </p>
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
            <span className="stat-label">Auth Engine</span>
            <KeyRound size={20} color="var(--primary)" />
          </div>
          <span className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
            JWT + RBAC
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Bcrypt Hashed Security
          </span>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Admin Email</span>
            <ShieldCheck size={20} color="#10b981" />
          </div>
          <span className="stat-value" style={{ fontSize: '1.1rem', wordBreak: 'break-all' }}>
            {user?.email}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Seeded Admin Account
          </span>
        </div>
      </div>

      <div className="glass-card info-card">
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={20} color="#a855f7" />
          <span>System Security & Access Controls</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Admin ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Access Level</div>
            <div style={{ fontWeight: 600, color: '#a855f7' }}>Full Administrative Access</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Foundation Status</div>
            <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} />
              Phase 1 Active & Ready
            </div>
          </div>
        </div>

        <div className="phase-roadmap-card" style={{ borderColor: 'rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)' }}>
          <div className="roadmap-title" style={{ color: '#a855f7' }}>
            <Sparkles size={18} />
            <strong>Upcoming in Phase 2:</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Admin doctor creation flow, provider credential approvals, appointment system telemetry, and audit logs will be added in Phase 2.
          </p>
        </div>
      </div>
    </div>
  );
};
