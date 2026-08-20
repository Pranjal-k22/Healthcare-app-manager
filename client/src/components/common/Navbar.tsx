import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="role-badge badge-admin">
            <ShieldCheck size={12} /> Admin
          </span>
        );
      case 'DOCTOR':
        return (
          <span className="role-badge badge-doctor">
            <Stethoscope size={12} /> Doctor
          </span>
        );
      case 'PATIENT':
      default:
        return (
          <span className="role-badge badge-patient">
            <UserIcon size={12} /> Patient
          </span>
        );
    }
  };

  const homeRoute = user ? ROLE_DASHBOARD_ROUTES[user.role] : '/login';

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to={homeRoute} className="nav-brand">
            <div className="brand-icon">
              <Activity size={22} />
            </div>
            <span className="brand-title">HealthPulse</span>
          </Link>

          {/* Contextual navigation based on role */}
          {isAuthenticated && user && (
            <nav className="nav-links">
              {user.role === 'PATIENT' && (
                <Link
                  to="/patient/doctors"
                  className={`nav-link-item ${
                    location.pathname.startsWith('/patient/doctors') ? 'nav-link-active' : ''
                  }`}
                >
                  <Search size={15} />
                  <span>Find Doctors</span>
                </Link>
              )}

              {user.role === 'DOCTOR' && (
                <Link
                  to="/doctor/profile"
                  className={`nav-link-item ${
                    location.pathname.startsWith('/doctor/profile') ? 'nav-link-active' : ''
                  }`}
                >
                  <Stethoscope size={15} />
                  <span>My Profile</span>
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/doctors"
                  className={`nav-link-item ${
                    location.pathname.startsWith('/admin/doctors') ? 'nav-link-active' : ''
                  }`}
                >
                  <Users size={15} />
                  <span>Manage Doctors</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="nav-user-panel">
          {isAuthenticated && user ? (
            <>
              <div className="user-identity">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="user-name">{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger-outline btn-sm"
                title="Sign out of your account"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
