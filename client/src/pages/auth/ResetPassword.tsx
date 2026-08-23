import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { HeartPulse, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const role = (searchParams.get('role')?.toUpperCase() as UserRole) || undefined;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing from URL.');
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
      const response = await resetPassword({ token, password, role });
      setIsSuccess(true);
      success(response.message || 'Password reset successfully!', 'Account Updated');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
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
              <span>HealthPulse Security Portal</span>
            </div>
            <div className="auth-hero-content">
              <h1 className="auth-hero-title">Set Your New Password</h1>
              <p className="auth-hero-desc">
                Choose a strong password to protect your HealthPulse account and medical data.
              </p>
            </div>
          </div>
          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • ISO 27001 Certified</span>
          </div>
        </div>

        {/* Right Column: Reset Password Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <h2>Reset Password</h2>
            <p>Enter your new password below to finalize account security update.</p>
          </div>

          {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Password Reset Complete</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your password has been updated successfully. Please log in with your new credentials.
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                Sign In Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                id="reset-password"
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
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Repeat new password"
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
                Update Password & Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
