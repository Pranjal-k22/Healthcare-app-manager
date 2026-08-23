import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HeartPulse, KeyRound, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';

export const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRequestId = searchParams.get('requestId') || '';

  const [requestId, setRequestId] = useState(initialRequestId);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { verifyOtp } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requestId.trim()) {
      setError('Please provide your Reset Request ID.');
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await verifyOtp({
        requestId: requestId.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setIsSuccess(true);
      success(response.message || 'Password reset successfully!', 'Security Updated');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired verification code.');
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
              <span>HealthPulse Verification Portal</span>
            </div>
            <div className="auth-hero-content">
              <h1 className="auth-hero-title">Enter Verification Code</h1>
              <p className="auth-hero-desc">
                Your request has been approved by administration. Enter the 6-digit OTP code sent to your registered email to set your new password.
              </p>
              <div className="auth-trust-points" style={{ marginTop: '1.5rem' }}>
                <div className="auth-trust-item">
                  <div className="auth-trust-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <span>10-minute ephemeral OTP expiration</span>
                </div>
              </div>
            </div>
          </div>
          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • ISO 27001 Certified</span>
          </div>
        </div>

        {/* Right Column: OTP Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <h2>Enter Verification Code</h2>
            <p>Input your 6-digit code and choose a new password.</p>
          </div>

          {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Password Reset Complete!</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your password has been updated and active sessions have been securely invalidated. You may now sign in.
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                Sign In Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!initialRequestId && (
                <Input
                  id="otp-request-id"
                  type="text"
                  label="Reset Request ID"
                  placeholder="Paste your request ID from email"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  required
                />
              )}

              <Input
                id="otp-code"
                type="text"
                label="6-Digit OTP Code"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                leftIcon={<KeyRound size={16} />}
                required
                style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
              />

              <Input
                id="otp-new-password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                id="otp-confirm-password"
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
                Verify Code & Update Password
              </Button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
