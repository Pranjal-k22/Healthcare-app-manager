import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import {
  HeartPulse,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Clock,
  Mail,
  Lock,
  User,
  Phone,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_DASHBOARD_ROUTES[user.role] || '/patient/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await register({
        name: fullName,
        email: email.trim(),
        password,
      });
      success(
        `Account created successfully! Welcome, ${newUser.name}.`,
        'Registration Complete'
      );
      navigate(ROLE_DASHBOARD_ROUTES[newUser.role] || '/patient/dashboard', {
        replace: true,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Registration failed. Please try again.';
      setError(errMsg);
      toastError(errMsg, 'Registration Failed');
    } finally {
      setIsSubmitting(false);
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
                Create Your Patient Account.
              </h1>
              <p className="auth-hero-desc">
                Gain instant access to top medical specialists, digital prescription history, and seamless appointment booking across all hospital departments.
              </p>

              <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                <img
                  src="/undraw_profile_9xdn.svg"
                  alt="Register Patient Account"
                  style={{ width: '220px', height: '140px', objectFit: 'contain' }}
                />
              </div>

              <div className="auth-trust-points">
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <CalendarCheck size={16} />
                  </div>
                  <span>Instant slot confirmation with 5-minute atomic holds</span>
                </div>
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <span>Encrypted health record storage & consultation summaries</span>
                </div>
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <Clock size={16} />
                  </div>
                  <span>Medication tracking & timely appointment reminders</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • ISO 27001 Certified</span>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <h2>Patient Registration</h2>
            <p>Fill in your personal details to create your patient account.</p>
          </div>

          {error && (
            <InlineAlert
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid-2col">
              <Input
                id="reg-first-name"
                type="text"
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
              <Input
                id="reg-last-name"
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              id="reg-email"
              type="email"
              label="Email Address"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              required
            />

            <div className="form-grid-2col">
              <Input
                id="reg-phone"
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone size={16} />}
              />
              <Select
                id="reg-gender"
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                  { value: 'Prefer not to say', label: 'Prefer not to say' },
                ]}
              />
            </div>

            <div className="form-grid-2col">
              <Input
                id="reg-password"
                type="password"
                label="Password"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                required
              />
              <Input
                id="reg-confirm-password"
                type="password"
                label="Confirm Password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(0, 98, 204, 0.05)',
                border: '1px solid rgba(0, 98, 204, 0.15)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0.75rem 0 1.25rem 0',
              }}
            >
              <UserCheck size={16} color="var(--primary)" />
              <span>Public registration creates a verified <strong>PATIENT</strong> account.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Complete Registration
            </Button>
          </form>

          <p className="auth-switch-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
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
      </div>
    </div>
  );
};

export default Register;
