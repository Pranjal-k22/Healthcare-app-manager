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
            <div className="hp-hero-text-col">
              <h1 className="hp-hero-title">
                Healthcare, connected. <br />
                <span className="hp-hero-title-gradient">
                  Simple. Secure. Smart.
                </span>
              </h1>

              <p className="hp-hero-subtitle">
                HealthPulse unites patients, doctors, and hospital administrators in one streamlined platform. Book specialist consultations in seconds, sync schedules seamlessly with Google Calendar, and manage clinical prescriptions with enterprise security.
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
                <div className="hp-hero-trust-item">
                  <Shield size={16} color="#34D399" />
                  <span>AES-256 Encrypted</span>
                </div>
                <div className="hp-hero-trust-item">
                  <Calendar size={16} color="#38BDF8" />
                  <span>Google Calendar Sync</span>
                </div>
                <div className="hp-hero-trust-item">
                  <Lock size={16} color="#FBBF24" />
                  <span>OAuth 2.0 Compliant</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Clinical Hub Preview Card */}
            <div className="hp-hero-showcase-container">
              <div className="hp-hero-preview-card">
                {/* Header */}
                <div className="hp-preview-header">
                  <div className="hp-preview-brand">
                    <div className="hp-preview-icon-box">
                      <HeartPulse size={22} color="#FFFFFF" />
                    </div>
                    <div>
                      <div className="hp-preview-title">HealthPulse Hospital</div>
                      <div className="hp-preview-subtitle">Clinical Hub &bull; Live Platform</div>
                    </div>
                  </div>
                  <span className="hp-preview-status-badge">
                    <span className="hp-status-dot" />
                    Operational
                  </span>
                </div>

                {/* Illustration Showcase Window */}
                <div className="hp-preview-illustration-frame">
                  <img
                    src="/landing.png"
                    alt="HealthPulse Clinical Staff and Patients"
                    className="hp-preview-illustration-img"
                  />
                  <div className="hp-illustration-overlay-tag">
                    <Sparkles size={13} color="#38BDF8" />
                    <span>Active OPD &amp; Care Center</span>
                  </div>
                </div>

                {/* Live Consultation Card */}
                <div className="hp-preview-item">
                  <div className="hp-preview-item-left">
                    <div className="hp-preview-item-icon hp-icon-blue">
                      <Stethoscope size={18} color="#2563EB" />
                    </div>
                    <div>
                      <div className="hp-preview-item-title">Cardiology Consultation</div>
                      <div className="hp-preview-item-desc">Dr. Sharma &bull; Confirmed Slot</div>
                    </div>
                  </div>
                  <div className="hp-preview-item-right">
                    <span className="hp-preview-time">10:30 AM</span>
                    <span className="hp-preview-synced">
                      <Calendar size={12} />
                      <span>Synced</span>
                    </span>
                  </div>
                </div>

                {/* Live Prescription Card */}
                <div className="hp-preview-item">
                  <div className="hp-preview-item-left">
                    <div className="hp-preview-item-icon hp-icon-green">
                      <FileCheck size={18} color="#059669" />
                    </div>
                    <div>
                      <div className="hp-preview-item-title">Digital Prescription Ready</div>
                      <div className="hp-preview-item-desc">Verified with dosage notes</div>
                    </div>
                  </div>
                  <div className="hp-preview-item-right">
                    <span className="hp-preview-pill-active">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS & TRUST HIGHLIGHT BAR ──────────────────────────────────── */}
      <section className="hp-stats-bar">
        <div className="hp-stats-inner">
          <div className="hp-stat-box">
            <div className="hp-stat-icon-wrap" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="hp-stat-number">50+</div>
              <div className="hp-stat-label">Specialist Doctors</div>
            </div>
          </div>

          <div className="hp-stat-box">
            <div className="hp-stat-icon-wrap" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div className="hp-stat-number">2-Way</div>
              <div className="hp-stat-label">Google Sync</div>
            </div>
          </div>

          <div className="hp-stat-box">
            <div className="hp-stat-icon-wrap" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#E11D48' }}>
              <HeartPulse size={22} />
            </div>
            <div>
              <div className="hp-stat-number">100%</div>
              <div className="hp-stat-label">Digital Prescriptions</div>
            </div>
          </div>

          <div className="hp-stat-box">
            <div className="hp-stat-icon-wrap" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
              <Shield size={22} />
            </div>
            <div>
              <div className="hp-stat-number">256-Bit</div>
              <div className="hp-stat-label">AES Data Encryption</div>
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
            Engineered from the ground up for modern hospitals, private clinics, doctors, and patients.
          </p>
        </div>

        <div className="hp-features-grid">
          {/* Card 1 */}
          <div className="hp-feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Search size={24} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Doctor Discovery &amp; Search
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Search specialist physicians by department, consultation fee, experience, and real-time available time slots.
            </p>
          </div>

          {/* Card 2 */}
          <div className="hp-feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Calendar size={24} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Google Calendar 2-Way Sync
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Directly sync your confirmed appointments to your Google Calendar. Get automatic popup and email notifications before each visit.
            </p>
          </div>

          {/* Card 3 */}
          <div className="hp-feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Stethoscope size={24} color="#E11D48" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Clinical Consultations &amp; Rx
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Doctors record clinical notes, diagnoses, and digital prescriptions with full historical tracking and printable invoices.
            </p>
          </div>

          {/* Card 4 */}
          <div className="hp-feature-card">
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={24} color="#9333EA" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
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
