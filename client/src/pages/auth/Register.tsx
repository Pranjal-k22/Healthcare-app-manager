import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  Shield,
  KeyRound,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'ADMIN' : 'PATIENT';

  const [accountType, setAccountType] = useState<'PATIENT' | 'ADMIN'>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState(
    initialRole === 'ADMIN' ? 'HealthPulseAdmin2026!' : ''
  );
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

    if (accountType === 'ADMIN' && !adminSecretKey.trim()) {
      setError('Please enter the Admin Secret Key to provision an Administrator account.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newUser = await register({
        name: fullName,
        email: email.trim(),
        password,
        role: accountType,
        adminSecretKey: accountType === 'ADMIN' ? adminSecretKey.trim() : undefined,
      });
      success(
        `Account created successfully! Welcome, ${newUser.name}.`,
        `${accountType === 'ADMIN' ? 'Administrator' : 'Patient'} Registration Complete`
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
                {accountType === 'ADMIN'
                  ? 'Administrator & Staff Registration.'
                  : 'Create Your Patient Account.'}
              </h1>
              <p className="auth-hero-desc">
                {accountType === 'ADMIN'
                  ? 'Provision administrative privileges to manage doctor rosters, oversee appointments, and audit hospital clinical workflows.'
                  : 'Gain instant access to top medical specialists, digital prescription history, and seamless appointment booking across all hospital departments.'}
              </p>

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
            <h2>
              {accountType === 'ADMIN' ? 'Administrator Registration' : 'Patient Registration'}
            </h2>
            <p>
              {accountType === 'ADMIN'
                ? 'Create a new hospital system administrator account.'
                : 'Fill in your personal details to create your patient account.'}
            </p>
          </div>

          {/* Account Type Toggle */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAccountType('PATIENT');
                setError(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: accountType === 'PATIENT' ? '#ffffff' : 'transparent',
                color: accountType === 'PATIENT' ? '#0062cc' : '#64748b',
                boxShadow:
                  accountType === 'PATIENT' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <User size={15} />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('ADMIN');
                if (!adminSecretKey) setAdminSecretKey('HealthPulseAdmin2026!');
                setError(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: accountType === 'ADMIN' ? '#3931af' : 'transparent',
                color: accountType === 'ADMIN' ? '#ffffff' : '#64748b',
                boxShadow:
                  accountType === 'ADMIN' ? '0 2px 4px rgba(57,49,175,0.25)' : 'none',
              }}
            >
              <Shield size={15} />
              <span>Administrator</span>
            </button>
          </div>

          {error && (
            <InlineAlert
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                id="reg-first-name"
                type="text"
                label="First Name"
                placeholder={accountType === 'ADMIN' ? 'Admin' : 'John'}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User size={16} />}
                required
              />
              <Input
                id="reg-last-name"
                type="text"
                label="Last Name"
                placeholder={accountType === 'ADMIN' ? 'Officer' : 'Doe'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              id="reg-email"
              type="email"
              label="Email Address"
              placeholder={accountType === 'ADMIN' ? 'admin@healthcare.com' : 'john.doe@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              required
            />

            {accountType === 'ADMIN' && (
              <div style={{ marginBottom: '1rem' }}>
                <Input
                  id="reg-admin-secret"
                  type="password"
                  label="Admin Secret Passcode"
                  placeholder="Enter authorized admin key"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  leftIcon={<KeyRound size={16} />}
                  helperText="Default system setup key: HealthPulseAdmin2026!"
                  required
                />
              </div>
            )}

            {accountType === 'PATIENT' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                backgroundColor:
                  accountType === 'ADMIN'
                    ? 'rgba(57, 49, 175, 0.06)'
                    : 'rgba(0, 98, 204, 0.05)',
                border: `1px solid ${
                  accountType === 'ADMIN'
                    ? 'rgba(57, 49, 175, 0.2)'
                    : 'rgba(0, 98, 204, 0.15)'
                }`,
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0.75rem 0 1.25rem 0',
              }}
            >
              {accountType === 'ADMIN' ? (
                <>
                  <Shield size={16} color="#3931af" />
                  <span>
                    Registering as <strong>ADMINISTRATOR</strong>. Allows doctor provisioning & full system audit.
                  </span>
                </>
              ) : (
                <>
                  <UserCheck size={16} color="var(--primary)" />
                  <span>Public registration creates a verified <strong>PATIENT</strong> account.</span>
                </>
              )}
            </div>

            <Button
              type="submit"
              variant={accountType === 'ADMIN' ? 'primary' : 'primary'}
              size="md"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={16} />}
              style={accountType === 'ADMIN' ? { backgroundColor: '#3931af' } : undefined}
            >
              {accountType === 'ADMIN'
                ? 'Register Administrator Account'
                : 'Complete Registration'}
            </Button>
          </form>

          <p className="auth-switch-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
