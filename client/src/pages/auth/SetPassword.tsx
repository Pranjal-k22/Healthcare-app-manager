import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HeartPulse, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Stethoscope } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

export const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { setPassword: setAccountPassword } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Doctor activation token is missing from URL.');
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
      const response = await setAccountPassword({ token, password });
      setIsSuccess(true);
      success(response.message || 'Account activated successfully!', 'Welcome Doctor');
    } catch (err: any) {
      setError(err.message || 'Failed to activate doctor account. Token may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        {/* Left Column: Brand Hero */}
        <div className="auth-hero-banner">
          <div>
            <div className="auth-brand-badge">
              <HeartPulse size={16} />
              <span>Doctor Onboarding & Activation</span>
            </div>
            <div className="auth-hero-content">
              <h1 className="auth-hero-title">Activate Doctor Account</h1>
              <p className="auth-hero-desc">
                Welcome to HealthPulse Clinical Network. Set your initial password to activate your consultant portal access.
              </p>
            </div>
          </div>
          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • HIPAA Certified</span>
          </div>
        </div>

        {/* Right Column: Activation Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 600, fontSize: '14px', marginBottom: '0.5rem' }}>
              <Stethoscope size={18} />
              <span>First-Time Doctor Activation</span>
            </div>
            <h2>Set Your Password</h2>
            <p>Create a password for your HealthPulse Doctor account.</p>
          </div>

          {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Account Activated!</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your doctor account has been activated. You can now log in to manage your consultation schedule and patient records.
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                Sign In to Doctor Portal
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                id="set-password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

              <Input
                id="set-confirm-password"
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight size={16} />}
                style={{ marginTop: '1.25rem' }}
              >
                Activate Account & Set Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
