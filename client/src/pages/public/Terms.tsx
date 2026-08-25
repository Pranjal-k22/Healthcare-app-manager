import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const Terms: React.FC = () => {
  return (
    <div className="hp-legal-page">
      {/* Top Header */}
      <div className="hp-legal-header">
        <div className="hp-legal-container">
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#93C5FD',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to HealthPulse Home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <FileText size={26} color="#38BDF8" style={{ flexShrink: 0 }} />
            <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Terms of Service
            </h1>
          </div>
          <p style={{ margin: '0.4rem 0 0', color: '#CBD5E1', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', maxWidth: '720px' }}>
            Last Updated: August 2026 &bull; HealthPulse Hospital Appointment &amp; Clinical Management Platform
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'clamp(1.5rem, 4vw, 3rem) 1rem' }}>
        <div className="hp-legal-container">
          <div className="hp-legal-card">

            {/* Medical Disclaimer Banner */}
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>
                  Important Medical &amp; Emergency Disclaimer
                </h2>
                <p style={{ margin: 0, color: '#B45309', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  HealthPulse is a healthcare workflow, scheduling, and clinical communication portal. If you are experiencing a medical emergency, do not wait for an online appointment booking; please immediately call your local emergency services (e.g., 911 / 112 / 108) or proceed to the nearest hospital emergency room.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.925rem' }}>
                By registering an account, accessing, or using HealthPulse, you agree to be bound by these Terms of Service and our <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</Link>. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                2. User Accounts &amp; Responsibilities
              </h2>
              <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.65, paddingLeft: '1.25rem', margin: 0, fontSize: '0.925rem' }}>
                <li style={{ marginBottom: '0.4rem' }}>You must provide accurate, current, and complete profile information.</li>
                <li style={{ marginBottom: '0.4rem' }}>You are responsible for maintaining the confidentiality of your login credentials and password.</li>
                <li style={{ marginBottom: '0.4rem' }}>You agree not to impersonate any medical practitioner or patient.</li>
                <li>Unauthorized automated scraping or vulnerability testing without explicit permission is strictly prohibited.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                3. Google Calendar &amp; Third-Party Integrations
              </h2>
              <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.65, paddingLeft: '1.25rem', margin: 0, fontSize: '0.925rem' }}>
                <li style={{ marginBottom: '0.4rem' }}>Connecting Google Calendar is entirely optional for all registered patients and doctors.</li>
                <li style={{ marginBottom: '0.4rem' }}>The application requests permission solely to manage calendar events related to confirmed appointments.</li>
                <li>You may disconnect or revoke calendar permissions at any time through your profile settings or Google Account security dashboard.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                4. Consultations, Appointments &amp; Cancellations
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.925rem' }}>
                Appointments are subject to doctor availability and hospital operating guidelines. Patients may reschedule or cancel appointments in accordance with hospital cancellation policies. Doctors reserve the right to modify consultation hours or approve medical leave as required for clinical emergencies.
              </p>
            </section>

            {/* Section 5 */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                5. Limitation of Liability
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.925rem' }}>
                HealthPulse provides scheduling tools and medical record assistance on an "as-is" basis. We do not guarantee uninterrupted system uptime and are not liable for third-party network outages or delays in external calendar sync services.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', marginBottom: '0.85rem' }}>
                6. Contact Information
              </h2>
              <div style={{
                backgroundColor: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div><strong>HealthPulse Administration:</strong> Adarsh</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:1975adarsh@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600, overflowWrap: 'anywhere' }}>
                      1975adarsh@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
