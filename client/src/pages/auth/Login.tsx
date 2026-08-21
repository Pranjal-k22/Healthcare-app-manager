import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import {
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  User as UserIcon,
  ArrowRight,
  Shield,
  Clock,
  CalendarCheck,
  Lock,
  Mail,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

type AuthRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<AuthRole>('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect immediately to role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname;
      navigate(from || ROLE_DASHBOARD_ROUTES[user.role], { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email/username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedUser = await login({ email, password });
      success(`Welcome back, ${loggedUser.name}!`, 'Signed In Successfully');
      const targetRoute = ROLE_DASHBOARD_ROUTES[loggedUser.role] || '/';
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
      toastError(errMsg, 'Authentication Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickCredentials = (role: AuthRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setEmail('admin@healthcare.com');
      setPassword('AdminPassword123!');
    } else if (role === 'DOCTOR') {
      setEmail('doctor@healthcare.com');
      setPassword('DoctorPassword123!');
    } else {
      setEmail('patient@healthcare.com');
      setPassword('PatientPassword123!');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        {/* Left Column: Brand Gradient Hero Banner */}
        <div className="auth-hero-banner">
          <div>
            <div className="auth-brand-badge">
              <HeartPulse size={16} />
              <span>HealthPulse Clinical Portal</span>
            </div>

            <div className="auth-hero-content">
              <h1 className="auth-hero-title">
                {selectedRole === 'PATIENT' && 'Book Your Appointments With Ease.'}
                {selectedRole === 'DOCTOR' && 'Clinical Consultation & Patient Workflow.'}
                {selectedRole === 'ADMIN' && 'Healthcare System Administration & Control.'}
              </h1>
              <p className="auth-hero-desc">
                {selectedRole === 'PATIENT' &&
                  'Connect with board-certified physicians, view real-time slot availability, and manage your health records effortlessly.'}
                {selectedRole === 'DOCTOR' &&
                  'Manage daily appointment schedules, conduct structured consultations, issue e-prescriptions, and review patient histories.'}
                {selectedRole === 'ADMIN' &&
                  'Centralized management of doctor credentials, leave calendars, operational schedules, and appointment telemetry.'}
              </p>

              <div className="auth-trust-points">
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <CalendarCheck size={16} />
                  </div>
                  <span>Instant slot confirmation with zero double-booking</span>
                </div>
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <span>HIPAA-compliant JWT authenticated session</span>
                </div>
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <Clock size={16} />
                  </div>
                  <span>24/7 Access to specialized clinical care & reminders</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • ISO 27001 Certified</span>
          </div>
        </div>

        {/* Right Column: White Card with Role Selector & Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <h2>Welcome Back</h2>
            <p>Select your portal role and enter your credentials to sign in.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="role-tabs-container" role="tablist">
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'PATIENT' ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedRole('PATIENT');
                setError(null);
              }}
              role="tab"
              aria-selected={selectedRole === 'PATIENT'}
            >
              <UserIcon size={16} />
              <span>Patient</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'DOCTOR' ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedRole('DOCTOR');
                setError(null);
              }}
              role="tab"
              aria-selected={selectedRole === 'DOCTOR'}
            >
              <Stethoscope size={16} />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'ADMIN' ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedRole('ADMIN');
                setError(null);
              }}
              role="tab"
              aria-selected={selectedRole === 'ADMIN'}
            >
              <ShieldCheck size={16} />
              <span>Administrator</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <InlineAlert
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Admin Security Notice */}
          {selectedRole === 'ADMIN' && (
            <div
              style={{
                backgroundColor: 'rgba(57, 49, 175, 0.05)',
                border: '1px solid rgba(57, 49, 175, 0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <Shield size={16} />
              <span>Administrative access requires verified system credentials.</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit}>
            <Input
              id="auth-email"
              type="text"
              label={selectedRole === 'ADMIN' ? 'Admin Username or Email' : 'Email Address'}
              placeholder={
                selectedRole === 'ADMIN'
                  ? 'admin@healthcare.com'
                  : selectedRole === 'DOCTOR'
                  ? 'doctor@healthcare.com'
                  : 'patient@healthcare.com'
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              id="auth-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
              required
            />

            <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <a
                href="#forgot"
                style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact hospital administration at support@healthpulse.com to reset credentials.');
                }}
              >
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In as {selectedRole}
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="helper-text" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Demo Quick Fill:
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickCredentials('PATIENT')}
              >
                Patient
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickCredentials('DOCTOR')}
              >
                Doctor
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickCredentials('ADMIN')}
              >
                Admin
              </Button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', fontSize: '14px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                Create Patient Account
              </Link>
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Hospital Administrator?{' '}
              <Link to="/register?role=admin" style={{ fontWeight: 600, color: '#3931af' }}>
                Register as Administrator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
