import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';
import {
  HeartPulse,
  Calendar,
  Shield,
  Stethoscope,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  FileCheck,
  Search,
} from 'lucide-react';
import { Footer } from '../../components/common/Footer';
import Button from '../../components/ui/Button';

export const Landing: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const dashboardRoute = user ? ROLE_DASHBOARD_ROUTES[user.role] || '/patient/dashboard' : '/login';

  return (
    <div className="hp-landing-page">
      
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="hp-landing-hero">
        <div className="hp-hero-inner">
          <div className="hp-hero-badge">
            <Sparkles size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
            <span>Intelligent Healthcare Scheduling &amp; Clinical Management</span>
          </div>

          <div className="hp-hero-grid">
            {/* Hero Left Copy */}
            <div>
              <h1 className="hp-hero-title">
                Healthcare, connected. <br />
                <span className="hp-hero-title-gradient">
                  Simple. Secure. Smart.
                </span>
              </h1>

              <p className="hp-hero-subtitle">
                HealthPulse unites patients, doctors, and hospital administrators in one streamlined portal. Book doctor appointments in seconds, sync schedules seamlessly with Google Calendar, and manage medical prescriptions with enterprise-grade security.
              </p>

              <div className="hp-hero-cta-wrap">
                {isAuthenticated ? (
                  <Link to={dashboardRoute} style={{ textDecoration: 'none' }}>
                    <Button
                      variant="primary"
                      size="lg"
                      rightIcon={<ArrowRight size={18} />}
                      style={{
                        backgroundColor: '#38BDF8',
                        color: '#0F2744',
                        fontWeight: 700,
                        boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)',
                        border: 'none',
                      }}
                    >
                      Go to Your Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/patient/doctors" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<Search size={18} />}
                        style={{
                          backgroundColor: '#38BDF8',
                          color: '#0F2744',
                          fontWeight: 700,
                          boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)',
                          border: 'none',
                        }}
                      >
                        Find Doctors
                      </Button>
                    </Link>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="outline"
                        size="lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Button
                        variant="ghost"
                        size="lg"
                        style={{
                          color: '#E0F2FE',
                          fontWeight: 600,
                        }}
                      >
                        Register Patient &rarr;
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="hp-hero-trust-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={16} color="#34D399" />
                  <span>AES-256 Encrypted</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} color="#38BDF8" />
                  <span>Google Calendar Sync</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={16} color="#FBBF24" />
                  <span>OAuth 2.0 Compliant</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="hp-hero-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <HeartPulse size={20} color="#ffffff" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>HealthPulse Hospital</h3>
                    <span style={{ fontSize: '0.75rem', color: '#93C5FD' }}>Clinical Hub &bull; Live Platform</span>
                  </div>
                </div>
                <span style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  Operational
                </span>
              </div>

              {/* Sample appointment cards preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Stethoscope size={18} color="#2563EB" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cardiology Consultation</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Dr. Sharma &bull; Confirmed Slot</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>10:30 AM</div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                      <Calendar size={10} /> Synced
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileCheck size={18} color="#059669" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Digital Prescription Ready</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified with dosage notes</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 7px', borderRadius: '6px', fontWeight: 600, flexShrink: 0 }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES SECTION ────────────────────────────────────────── */}
      <section className="hp-features-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>
            Comprehensive Clinical Workflow
          </h2>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Engineered from the ground up for hospitals, private clinics, doctors, and patients.
          </p>
        </div>

        <div className="hp-features-grid">
          {/* Card 1 */}
          <div className="hp-feature-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Search size={22} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Doctor Discovery &amp; Search
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Search specialist physicians by department, consultation fee, experience, and real-time available time slots.
            </p>
          </div>

          {/* Card 2 */}
          <div className="hp-feature-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Calendar size={22} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Google Calendar 2-Way Sync
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Directly sync your confirmed appointments to your Google Calendar. Get automatic popup and email notifications before each visit.
            </p>
          </div>

          {/* Card 3 */}
          <div className="hp-feature-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Stethoscope size={22} color="#D97706" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Clinical Consultations &amp; Rx
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Doctors record clinical notes, diagnoses, and digital prescriptions with full historical tracking and printable invoices.
            </p>
          </div>

          {/* Card 4 */}
          <div className="hp-feature-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Users size={22} color="#9333EA" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Role-Based Access Control
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Dedicated, purpose-built portals for Patients, Medical Doctors, and Hospital Administrators with strict boundary enforcement.
            </p>
          </div>
        </div>
      </section>

      {/* ── GOOGLE INTEGRATION & SECURITY TRANSPARENCY SECTION ────────────── */}
      <section className="hp-oauth-section">
        <div className="hp-oauth-card-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              backgroundColor: '#2563EB',
              borderRadius: '10px',
              padding: '8px',
              color: '#ffffff',
              display: 'flex',
              flexShrink: 0,
            }}>
              <Shield size={22} />
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Google OAuth &amp; Calendar Integration Transparency
            </h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            HealthPulse integrates with Google APIs solely to enhance your healthcare appointment scheduling experience. We uphold rigorous security practices in accordance with Google's API Services User Data Policy.
          </p>

          <div className="hp-oauth-grid">
            <div className="hp-oauth-card">
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Requested OAuth Scope
              </h4>
              <code style={{ fontSize: '0.8rem', color: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '2px 6px', borderRadius: '4px', display: 'block', overflowWrap: 'anywhere', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                calendar.events
              </code>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Used strictly to create, update, and manage appointment event reminders on your primary Google Calendar.
              </p>
            </div>

            <div className="hp-oauth-card">
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Encrypted Token Storage
              </h4>
              <span style={{ fontSize: '0.8rem', color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 600, marginBottom: '0.5rem' }}>
                AES-256-GCM Encryption
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your Google OAuth tokens are securely encrypted at rest. Plaintext tokens are never exposed to browser clients.
              </p>
            </div>

            <div className="hp-oauth-card">
              <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Limited Use &amp; Zero Ads
              </h4>
              <span style={{ fontSize: '0.8rem', color: '#D97706', backgroundColor: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Zero Data Monetization
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                We never transfer, sell, or use Google user data for advertising, marketing, or general AI model training.
              </p>
            </div>
          </div>

          <div className="hp-oauth-cta-bar">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Learn more about how we safeguard your information and manage consent:
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/privacy"
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                }}
              >
                View Privacy Policy &rarr;
              </Link>
              <Link
                to="/terms"
                style={{
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ────────────────────────────────────────── */}
      <section className="hp-cta-section">
        <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
          Ready to experience seamless healthcare scheduling?
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
          Sign in or create a patient account to browse doctors, book consultations, and manage your medical care online.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button
              variant="primary"
              size="lg"
              style={{
                backgroundColor: '#2563EB',
                fontWeight: 700,
                padding: '0.85rem 1.75rem',
              }}
            >
              Register as New Patient
            </Button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              size="lg"
              style={{
                fontWeight: 600,
                padding: '0.85rem 1.75rem',
              }}
            >
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER WITH VISIBLE PRIVACY & TERMS LINKS ──────────────────────── */}
      <Footer />
    </div>
  );
};

export default Landing;
