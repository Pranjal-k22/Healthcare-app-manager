import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { HeartPulse, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InlineAlert from '../../components/ui/InlineAlert';

export const ForgotPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role')?.toUpperCase() as UserRole) || 'PATIENT';
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please provide your account email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await forgotPassword({ email: email.trim(), role });
      setSuccessMessage(
        response.message || 'If an account exists, your request has been sent for admin approval. You will receive a verification code by email once approved.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset request. Please try again.');
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
              <span>HealthPulse Clinical Security</span>
            </div>
            <div className="auth-hero-content">
              <h1 className="auth-hero-title">Reset Your Password</h1>
              <p className="auth-hero-desc">
                Enter your account email address below. Your password reset request will be submitted to hospital administration for approval.
              </p>
            </div>
          </div>
          <div className="auth-hero-footer">
            <span>© 2026 HealthPulse Medical Network • HIPAA Security Shield</span>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <h2>Forgot Password</h2>
            <p>Select your portal role and enter your registered email address.</p>
          </div>

          {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

          {successMessage ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Check Your Inbox</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {successMessage}
              </p>
              <Link to="/login">
                <Button variant="outline" size="md" leftIcon={<ArrowLeft size={16} />}>
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="role-tabs-container" style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className={`role-tab-btn ${role === 'PATIENT' ? 'is-active' : ''}`}
                  onClick={() => setRole('PATIENT')}
                >
                  Patient
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${role === 'DOCTOR' ? 'is-active' : ''}`}
                  onClick={() => setRole('DOCTOR')}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${role === 'ADMIN' ? 'is-active' : ''}`}
                  onClick={() => setRole('ADMIN')}
                >
                  Administrator
                </button>
              </div>

              <Input
                id="forgot-email"
                type="email"
                label="Account Email Address"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
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
                Send Password Reset Link
              </Button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
