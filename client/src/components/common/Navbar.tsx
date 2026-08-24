import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { NavCalendarButton } from './NavCalendarButton';
import {
  Calendar,
  CalendarCheck,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
  Users,
  Menu,
  X,
  HeartPulse,
  KeyRound,
} from 'lucide-react';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Avatar from '../ui/Avatar';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="role-badge badge-admin">
            <ShieldCheck size={11} /> Admin
          </span>
        );
      case 'DOCTOR':
        return (
          <span className="role-badge badge-doctor">
            <Stethoscope size={11} /> Doctor
          </span>
        );
      case 'PATIENT':
      default:
        return (
          <span className="role-badge badge-patient">
            <UserIcon size={11} /> Patient
          </span>
        );
    }
  };

  const homeRoute = user ? ROLE_DASHBOARD_ROUTES[user.role] : '/login';

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link to={homeRoute} className="nav-brand">
              <div className="brand-icon">
                <HeartPulse size={22} />
              </div>
              <span className="brand-title">HealthPulse Hospital</span>
            </Link>

            {/* Contextual navigation based on role or public */}
            <nav className="nav-links">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`nav-link-item ${location.pathname === '/login' ? 'nav-link-active' : ''}`}
                  >
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/patient/doctors"
                    className={`nav-link-item ${location.pathname.startsWith('/patient/doctors') ? 'nav-link-active' : ''}`}
                  >
                    <Search size={15} />
                    <span>Find Doctors</span>
                  </Link>
                  <a
                    href="#services"
                    className="nav-link-item"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                  >
                    <span>Services</span>
                  </a>
                  <a
                    href="#contact"
                    className="nav-link-item"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                  >
                    <span>Contact</span>
                  </a>
                </>
              ) : (
                <>
                  {user?.role === 'PATIENT' && (
                    <>
                      <Link
                        to="/patient/dashboard"
                        className={`nav-link-item ${location.pathname === '/patient/dashboard' ? 'nav-link-active' : ''}`}
                      >
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/patient/doctors"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/patient/doctors') ||
                          location.pathname.startsWith('/patient/book')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <Search size={15} />
                        <span>Find Doctors</span>
                      </Link>
                      <Link
                        to="/patient/appointments"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/patient/appointments')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <CalendarCheck size={15} />
                        <span>Appointments</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'DOCTOR' && (
                    <>
                      <Link
                        to="/doctor/dashboard"
                        className={`nav-link-item ${location.pathname === '/doctor/dashboard' ? 'nav-link-active' : ''}`}
                      >
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/doctor/appointments"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/doctor/appointments')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <Calendar size={15} />
                        <span>Appointments</span>
                      </Link>
                      <Link
                        to="/doctor/profile"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/doctor/profile')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <Stethoscope size={15} />
                        <span>My Profile</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`nav-link-item ${location.pathname === '/admin/dashboard' ? 'nav-link-active' : ''}`}
                      >
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/doctors"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/admin/doctors')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <Users size={15} />
                        <span>Manage Doctors</span>
                      </Link>
                      <Link
                        to="/admin/appointments"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/admin/appointments')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <Calendar size={15} />
                        <span>Appointments</span>
                      </Link>
                      <Link
                        to="/admin/doctor-reset-requests"
                        className={`nav-link-item ${
                          location.pathname.startsWith('/admin/doctor-reset-requests')
                            ? 'nav-link-active'
                            : ''
                        }`}
                      >
                        <KeyRound size={15} />
                        <span>Doctor Resets</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="nav-user-panel">
            {isAuthenticated && user ? (
              <>
                <NavCalendarButton />
                <NotificationBell />

                <Link
                  to={
                    user.role === 'DOCTOR'
                      ? '/doctor/profile'
                      : user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : '/patient/profile'
                  }
                  title="View & Edit Account Profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar
                    name={user.name}
                    seed={user._id || user.email}
                    size="sm"
                  />
                  <div className="user-identity">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <span className="user-name">{user.name}</span>
                      {getRoleBadge(user.role)}
                    </div>
                    <span className="user-email">{user.email}</span>
                  </div>
                </Link>
                <div className="nav-logout-btn">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut size={14} />}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                    title="Sign out of your account"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '8px 14px',
                  }}
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: '#ffffff',
                      color: 'var(--primary)',
                      borderColor: '#ffffff',
                    }}
                  >
                    Register Patient
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20, 45, 80, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--white)',
              padding: '1.5rem',
              maxWidth: '300px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>HealthPulse Hospital</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Clinical Portal</div>
            </div>

            <Link
              to={homeRoute}
              style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 600 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home / Dashboard
            </Link>
            <Link
              to="/patient/doctors"
              style={{ padding: '8px 0', color: 'var(--text-primary)', fontWeight: 500 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Doctors
            </Link>

            {isAuthenticated ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                leftIcon={<LogOut size={14} />}
                style={{ marginTop: 'auto' }}
              >
                Logout
              </Button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>
                    Register Patient
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of HealthPulse Hospital Portal?"
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Logged In"
        variant="warning"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Navbar;
