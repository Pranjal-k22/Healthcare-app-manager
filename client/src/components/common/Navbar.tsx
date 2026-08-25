import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { NavCalendarButton } from './NavCalendarButton';
import { AppearanceDropdown } from './ThemeToggle';
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
    navigate('/login', { replace: true });
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

  const homeRoute = user ? ROLE_DASHBOARD_ROUTES[user.role] : '/';

  // Close drawer on Escape key or route change
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 0 }}>
            <Link to={homeRoute} className="nav-brand">
              <div className="brand-icon">
                <HeartPulse size={20} />
              </div>
              <span className="brand-title">HealthPulse</span>
            </Link>

            {/* Contextual navigation based on role or public */}
            <nav className="nav-links">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`nav-link-item ${location.pathname === '/' ? 'nav-link-active' : ''}`}
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
                  <Link
                    to="/privacy"
                    className={`nav-link-item ${location.pathname === '/privacy' ? 'nav-link-active' : ''}`}
                  >
                    <span>Privacy Policy</span>
                  </Link>
                  <Link
                    to="/terms"
                    className={`nav-link-item ${location.pathname === '/terms' ? 'nav-link-active' : ''}`}
                  >
                    <span>Terms</span>
                  </Link>
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
                <div className="nav-desktop-only">
                  <NavCalendarButton />
                </div>
                <NotificationBell />
                <AppearanceDropdown />

                <Link
                  to={
                    user.role === 'DOCTOR'
                      ? '/doctor/profile'
                      : user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : '/patient/profile'
                  }
                  title="View & Edit Account Profile"
                  className="nav-desktop-only"
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

                <div className="nav-logout-btn nav-desktop-only">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    leftIcon={<LogOut size={14} />}
                    data-testid="logout-button"
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
              <div className="nav-auth-actions">
                <Link
                  to="/login"
                  className="nav-signin-link"
                  style={{
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '8px 12px',
                    textDecoration: 'none',
                  }}
                >
                  Sign In
                </Link>
                <Link to="/register" className="nav-register-btn-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      backgroundColor: '#ffffff',
                      color: 'var(--medical-blue-dark)',
                      borderColor: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="nav-mobile-toggle"
              data-testid="user-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="hp-mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="hp-mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Brand in Drawer */}
            <div className="hp-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="brand-icon" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: '#fff' }}>
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>HealthPulse Hospital</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Clinical Portal</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* User Account Card if Logged In */}
            {isAuthenticated && user && (
              <div className="hp-drawer-user-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Avatar name={user.name} seed={user._id || user.email} size="md" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user.name}</span>
                      {getRoleBadge(user.role)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <NavCalendarButton />
                </div>
              </div>
            )}

            {/* Nav Links in Drawer */}
            <div className="hp-drawer-nav-list">
              <span className="hp-drawer-nav-label">Navigation</span>

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className={`hp-drawer-nav-item ${location.pathname === '/' ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Home / Overview</span>
                  </Link>
                  <Link
                    to="/patient/doctors"
                    className={`hp-drawer-nav-item ${location.pathname.startsWith('/patient/doctors') ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search size={16} />
                    <span>Find Doctors & Specialists</span>
                  </Link>
                  <Link
                    to="/privacy"
                    className={`hp-drawer-nav-item ${location.pathname === '/privacy' ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Privacy Policy</span>
                  </Link>
                  <Link
                    to="/terms"
                    className={`hp-drawer-nav-item ${location.pathname === '/terms' ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Terms of Service</span>
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === 'PATIENT' && (
                    <>
                      <Link
                        to="/patient/dashboard"
                        className={`hp-drawer-nav-item ${location.pathname === '/patient/dashboard' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/patient/doctors"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/patient/doctors') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Search size={16} />
                        <span>Find Doctors</span>
                      </Link>
                      <Link
                        to="/patient/appointments"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/patient/appointments') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CalendarCheck size={16} />
                        <span>My Appointments</span>
                      </Link>
                      <Link
                        to="/patient/prescriptions"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/patient/prescriptions') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>Prescriptions</span>
                      </Link>
                      <Link
                        to="/patient/profile"
                        className={`hp-drawer-nav-item ${location.pathname === '/patient/profile' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon size={16} />
                        <span>Profile & Settings</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'DOCTOR' && (
                    <>
                      <Link
                        to="/doctor/dashboard"
                        className={`hp-drawer-nav-item ${location.pathname === '/doctor/dashboard' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>Doctor Dashboard</span>
                      </Link>
                      <Link
                        to="/doctor/appointments"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/doctor/appointments') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar size={16} />
                        <span>Consultations & Schedule</span>
                      </Link>
                      <Link
                        to="/doctor/profile"
                        className={`hp-drawer-nav-item ${location.pathname === '/doctor/profile' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Stethoscope size={16} />
                        <span>Doctor Profile & Hours</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`hp-drawer-nav-item ${location.pathname === '/admin/dashboard' ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>Admin Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/doctors"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/admin/doctors') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users size={16} />
                        <span>Manage Doctors</span>
                      </Link>
                      <Link
                        to="/admin/appointments"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/admin/appointments') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar size={16} />
                        <span>All Appointments</span>
                      </Link>
                      <Link
                        to="/admin/doctor-reset-requests"
                        className={`hp-drawer-nav-item ${location.pathname.startsWith('/admin/doctor-reset-requests') ? 'is-active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <KeyRound size={16} />
                        <span>Doctor Reset Requests</span>
                      </Link>
                    </>
                  )}

                  <div style={{ margin: '0.75rem 0', borderTop: '1px solid var(--border)' }} />
                  <Link
                    to="/privacy"
                    className={`hp-drawer-nav-item ${location.pathname === '/privacy' ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Privacy Policy</span>
                  </Link>
                  <Link
                    to="/terms"
                    className={`hp-drawer-nav-item ${location.pathname === '/terms' ? 'is-active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Terms of Service</span>
                  </Link>
                </>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="hp-drawer-footer">
              {isAuthenticated ? (
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  data-testid="logout-button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  leftIcon={<LogOut size={16} />}
                >
                  Sign Out
                </Button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="md" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="md" fullWidth>
                      Register Patient
                    </Button>
                  </Link>
                </div>
              )}
            </div>
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
