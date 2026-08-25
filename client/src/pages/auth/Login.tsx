import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import {
  HeartPulse,
  User as UserIcon,
  Stethoscope,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
} from 'lucide-react';
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
    if (isSubmitting) return;
    setError(null);

    if (!email || !password) {
      setError('Please check your credentials and try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedUser = await login({ email, password, role: selectedRole });
      success(`Welcome back, ${loggedUser.name}!`, 'Signed In Successfully');
      const targetRoute = ROLE_DASHBOARD_ROUTES[loggedUser.role] || '/patient/dashboard';
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      let errMsg = 'Please check your credentials and try again.';

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
      setEmail('1975adarsh@gmail.com');
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
    <div className="hp-auth-page">
      <div className="hp-auth-split-wrapper">
        {/* LEFT BRAND PANEL (54% Width) */}
        <aside className="hp-auth-left-panel">
          <div>
            {/* HealthPulse Brand Logo */}
            <div className="hp-auth-left-brand">
              <div className="hp-auth-logo-icon">
                <HeartPulse size={24} color="#ffffff" />
              </div>
              <div>
                <h2 className="hp-auth-logo-text">HealthPulse</h2>
                <span className="hp-auth-logo-tagline">Healthcare, connected.</span>
              </div>
            </div>

            {/* Primary Hero Section */}
            <div className="hp-auth-left-hero">
              <h1 className="hp-auth-hero-title">Healthcare made simpler.</h1>
              <p className="hp-auth-hero-subtitle">
                Book appointments, manage consultations and access your healthcare information from one secure place.
              </p>

              <div className="hp-auth-hero-image-wrap">
                <img
                  src="/undraw_doctor_aum1.svg"
                  alt="Healthcare consultation illustration"
                  className="hp-auth-hero-image"
                />
              </div>
            </div>
          </div>

          {/* Security Microcopy */}
          <div className="hp-auth-left-footer">
            <Shield size={16} color="#2563EB" />
            <span>Your session is protected using secure authenticated access.</span>
          </div>
        </aside>

        {/* RIGHT SIGN-IN PANEL (46% Width) */}
        <main className="hp-auth-right-panel">
          <div className="hp-auth-form-container">
            {/* Mobile Header Brand */}
            <div className="hp-auth-mobile-brand">
              <div className="hp-auth-logo-icon">
                <HeartPulse size={22} color="#ffffff" />
              </div>
              <div>
                <h2 className="hp-auth-logo-text">HealthPulse</h2>
                <span className="hp-auth-logo-tagline">Healthcare, connected.</span>
              </div>
            </div>

            {/* Form Title Block */}
            <header className="hp-auth-header">
              <h1 className="hp-auth-title">Welcome back</h1>
              <p className="hp-auth-subtitle">Sign in to continue to HealthPulse.</p>
            </header>

            {/* Segmented Control Role Selector */}
            <div className="hp-role-segmented-control" role="tablist" aria-label="Select account type">
              <button
                type="button"
                role="tab"
                aria-selected={selectedRole === 'PATIENT'}
                data-testid="role-patient"
                className={`hp-role-segment-btn ${selectedRole === 'PATIENT' ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedRole('PATIENT');
                  setError(null);
                }}
              >
                <UserIcon size={15} />
                <span>Patient</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedRole === 'DOCTOR'}
                data-testid="role-doctor"
                className={`hp-role-segment-btn ${selectedRole === 'DOCTOR' ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedRole('DOCTOR');
                  setError(null);
                }}
              >
                <Stethoscope size={15} />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedRole === 'ADMIN'}
                data-testid="role-admin"
                className={`hp-role-segment-btn ${selectedRole === 'ADMIN' ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedRole('ADMIN');
                  setError(null);
                }}
              >
                <ShieldCheck size={15} />
                <span>Admin</span>
              </button>
            </div>

            {/* Inline Error Alert */}
            {error && (
              <InlineAlert
                type="danger"
                title="Unable to sign in"
                message={error}
                onClose={() => setError(null)}
                className="mb-4"
              />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="hp-auth-form" noValidate>
              {/* Email Input */}
              <div className="hp-auth-input-group">
                <label htmlFor="auth-email" className="hp-auth-label">
                  {selectedRole === 'ADMIN' ? 'Admin Username or Email' : 'Email address'}
                </label>
                <div className="hp-auth-input-wrapper">
                  <span className="hp-auth-input-icon-left">
                    <Mail size={18} />
                  </span>
                  <input
                    id="auth-email"
                    type="text"
                    className="hp-auth-input"
                    placeholder={
                      selectedRole === 'ADMIN'
                        ? '1975adarsh@gmail.com'
                        : selectedRole === 'DOCTOR'
                        ? 'doctor@healthcare.com'
                        : 'patient@healthcare.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="hp-auth-input-group">
                <label htmlFor="auth-password" className="hp-auth-label">
                  Password
                </label>
                <div className="hp-auth-input-wrapper">
                  <span className="hp-auth-input-icon-left">
                    <Lock size={18} />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    className="hp-auth-input has-right-icon"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="hp-auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="hp-forgot-password-row">
                <Link
                  to={`/forgot-password?role=${selectedRole}`}
                  className="hp-forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                className="hp-auth-cta-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="btn-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="hp-demo-quickfill-block">
              <span className="hp-demo-quickfill-label">Demo Quick Fill:</span>
              <div className="hp-demo-btn-grid">
                <button
                  type="button"
                  className="hp-demo-btn"
                  onClick={() => fillQuickCredentials('PATIENT')}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className="hp-demo-btn"
                  onClick={() => fillQuickCredentials('DOCTOR')}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  className="hp-demo-btn"
                  onClick={() => fillQuickCredentials('ADMIN')}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Patient Registration Footer Link */}
            {selectedRole === 'PATIENT' && (
              <div className="hp-auth-register-footer">
                <span>New to HealthPulse?</span>
                <Link to="/register" className="hp-auth-register-link">
                  Create an account
                </Link>
              </div>
            )}

            {/* Legal Links */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}>
              <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
