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
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect immediately to backend role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname;
      const targetRoute = from || ROLE_DASHBOARD_ROUTES[user.role] || '/patient/dashboard';
      navigate(targetRoute, { replace: true });
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
      const loggedUser = await login({ email, password, role: selectedRole });
      success(`Welcome back, ${loggedUser.name}!`, 'Signed In Successfully');
      const targetRoute = ROLE_DASHBOARD_ROUTES[loggedUser.role] || '/patient/dashboard';
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      let errMsg = 'Login failed. Please check your credentials.';

      if (err.response?.data?.code === 'ROLE_MISMATCH') {
        errMsg = err.response.data.message;
      } else if (err.response?.status === 401) {
        errMsg = 'Incorrect email or password. Please verify your credentials.';
      } else if (err.response?.status === 429) {
        errMsg = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (!err.response) {
        errMsg = 'HealthPulse services are temporarily unavailable. Please try again shortly.';
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }

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
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Link
                to={`/forgot-password?role=${selectedRole}`}
                style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              {isSubmitting ? 'Signing in...' : `Sign In as ${selectedRole}`}
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

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '14px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                Create Patient Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
