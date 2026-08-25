import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const Privacy: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Breadcrumb Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2744 0%, #1E3A8A 100%)',
        color: '#ffffff',
        padding: '3rem 1.5rem 2.5rem',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
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
              marginBottom: '1.25rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to HealthPulse Home</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={28} color="#38BDF8" />
            <h1 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Privacy Policy
            </h1>
          </div>
          <p style={{ margin: '0.5rem 0 0', color: '#CBD5E1', fontSize: '1rem', maxWidth: '720px' }}>
            Last Updated: August 2026 &bull; HealthPulse Hospital Appointment & Clinical Management Platform
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <main style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          padding: '2.5rem 2.5rem',
        }}>

          {/* Quick Notice Card */}
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}>
            <Shield size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#1E40AF' }}>
                Commitment to Patient Privacy & Data Protection
              </h2>
              <p style={{ margin: 0, color: '#1E3A8A', fontSize: '0.9rem', lineHeight: 1.5 }}>
                HealthPulse is designed with privacy-first standards. We employ industry-grade encryption (AES-256-GCM), secure session tokens, and strict access controls to protect patient and clinical data. We do not sell, rent, or monetize your personal or medical data.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div style={{
            backgroundColor: 'var(--surface-alt)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Table of Contents
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.4rem',
              fontSize: '0.875rem',
              color: 'var(--primary)',
            }}>
              <li><a href="#section-1" style={{ color: 'var(--primary)', textDecoration: 'none' }}>1. Introduction & Application Purpose</a></li>
              <li><a href="#section-2" style={{ color: 'var(--primary)', textDecoration: 'none' }}>2. Information We Collect</a></li>
              <li><a href="#section-3" style={{ color: 'var(--primary)', textDecoration: 'none' }}>3. Google API Services & Calendar Integration</a></li>
              <li><a href="#section-4" style={{ color: 'var(--primary)', textDecoration: 'none' }}>4. Google Limited Use Disclosure</a></li>
              <li><a href="#section-5" style={{ color: 'var(--primary)', textDecoration: 'none' }}>5. How We Use and Share Data</a></li>
              <li><a href="#section-6" style={{ color: 'var(--primary)', textDecoration: 'none' }}>6. Data Storage & Security (AES-256)</a></li>
              <li><a href="#section-7" style={{ color: 'var(--primary)', textDecoration: 'none' }}>7. User Rights & Data Deletion</a></li>
              <li><a href="#section-8" style={{ color: 'var(--primary)', textDecoration: 'none' }}>8. Revoking Permissions & Access</a></li>
              <li><a href="#section-9" style={{ color: 'var(--primary)', textDecoration: 'none' }}>9. Developer & Support Contact</a></li>
            </ul>
          </div>

          {/* Section 1 */}
          <section id="section-1" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              1. Introduction & Application Purpose
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              HealthPulse ("we", "our", or "the Platform") operates an intelligent healthcare appointment scheduling, doctor availability management, and clinical consultation software portal. This Privacy Policy details how we collect, store, process, and protect your information when you access or use our application.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              By registering an account, booking appointments, or connecting external services such as Google Calendar, you agree to the collection and handling of your information as described in this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section id="section-2" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              2. Information We Collect
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              To provide clinical scheduling and healthcare portal services, we collect the following categories of information:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Account & Profile Information:</strong> Full name, email address, phone number, role (Patient, Doctor, or Admin), and encrypted password hashes.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Healthcare & Appointment Records:</strong> Selected doctor, department, consultation dates/time slots, symptoms or appointment notes, prescription details, and payment/billing statuses.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Doctor Profile Information:</strong> Medical specialization, qualifications, clinical experience, consultation fees, and available working hours.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>System & Authentication Logs:</strong> IP address, browser type, timestamp logs, and authentication token metadata used strictly for security auditing and rate-limiting.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="section-3" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              3. Google API Services & Calendar Integration
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              HealthPulse offers an optional 2-Way Google Calendar integration that allows patients and doctors to automatically synchronize their medical appointments with their personal Google Calendars.
            </p>
            <div style={{
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '1rem',
            }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Google OAuth Scopes Requested:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <li>
                  <code style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', padding: '2px 6px', borderRadius: '4px' }}>
                    https://www.googleapis.com/auth/calendar.events
                  </code>
                  <br />
                  <strong>Purpose:</strong> Allows HealthPulse to create, update, or remove calendar events corresponding strictly to confirmed appointments booked through the platform.
                </li>
                <li style={{ marginTop: '0.5rem' }}>
                  <code style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', padding: '2px 6px', borderRadius: '4px' }}>
                    https://www.googleapis.com/auth/userinfo.email
                  </code>
                  <br />
                  <strong>Purpose:</strong> Used solely to identify which Google account was authorized and verify account matching.
                </li>
              </ul>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              <strong>How We Handle Google Calendar Data:</strong> HealthPulse only accesses and manages events created by the application itself. We do not read, index, or store personal events, contacts, emails, or unrelated calendar entries from your Google account.
            </p>
          </section>

          {/* Section 4 */}
          <section id="section-4" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              4. Google API Services User Data Policy Compliance (Limited Use Disclosure)
            </h2>
            <div style={{
              borderLeft: '4px solid #2563EB',
              backgroundColor: '#F8FAFC',
              padding: '1rem 1.25rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '1rem',
            }}>
              <p style={{ margin: 0, color: '#1E293B', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6 }}>
                HealthPulse's use and transfer of information received from Google APIs to any other app will adhere to the{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563EB', textDecoration: 'underline' }}
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              Specifically, we guarantee the following:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  <span>No Transfer to Third Parties</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  We do not sell, rent, or transfer Google user data to data brokers, advertising networks, or third-party service providers.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  <span>No Advertising Use</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Google user data is never used to serve targeted advertisements or retargeting campaigns.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  <span>No Generalized AI Training</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Google Calendar event data is never used to train generalized artificial intelligence (AI) or machine learning (ML) models.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Strict Human Access Restrictions</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  No human employee or administrator reads your private calendar entries unless explicitly requested by you for technical troubleshooting with prior consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              5. How We Use and Share Data
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.5rem' }}>
              Data collected by HealthPulse is used exclusively to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
              <li>Facilitate real-time appointment booking and schedule conflict avoidance.</li>
              <li>Deliver automated appointment reminders via email (via verified HTTPS API).</li>
              <li>Provide doctors with necessary medical history and consultation notes for care delivery.</li>
              <li>Maintain clinical prescriptions, invoice generation, and attendance management.</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              We do not share your medical or personal information with any third party, except as required by applicable healthcare laws or law enforcement regulations.
            </p>
          </section>

          {/* Section 6 */}
          <section id="section-6" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              6. Data Storage & Security (AES-256-GCM Encryption)
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              Security is built into every layer of HealthPulse:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>OAuth Token Encryption:</strong> All Google OAuth access tokens and refresh tokens are encrypted at rest using industry-standard <strong>AES-256-GCM</strong> authenticated encryption. Plaintext tokens are never written to database disks or exposed to client-side browsers.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Secure Transport (HTTPS/TLS):</strong> All data transmissions between your browser, our API server, and Google endpoints are enforced over TLS 1.3 encryption.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Password Protection:</strong> User passwords are encrypted using strong bcrypt hashing algorithms with high cost factors.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="section-7" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              7. User Rights & Data Deletion
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              You have the full right to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
              <li>Access, view, and export all personal and appointment data linked to your account.</li>
              <li>Request modification or correction of inaccurate personal details.</li>
              <li>Request complete permanent deletion of your account, consultation history, and OAuth tokens.</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              To request account deletion or data purge, contact us at{' '}
              <a href="mailto:1975adarsh@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                1975adarsh@gmail.com
              </a>
              . Requests are processed within 48 hours.
            </p>
          </section>

          {/* Section 8 */}
          <section id="section-8" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              8. Revoking Google Calendar Permissions
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              You can disconnect HealthPulse from your Google Account at any time through either of the following methods:
            </p>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Inside HealthPulse:</strong> Navigate to your <em>Profile &rarr; Google Calendar Sync</em> settings and click <strong>Disconnect Calendar</strong>. This instantly invalidates and deletes your stored encrypted tokens.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Via Google Security Settings:</strong> Visit{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  Google Third-Party App Permissions
                </a>{' '}
                and remove HealthPulse access directly from your Google Account.
              </li>
            </ol>
          </section>

          {/* Section 9 */}
          <section id="section-9">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              9. Developer & Support Contact
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1rem' }}>
              If you have any questions, concerns, or inquiries regarding this Privacy Policy, our Google OAuth data practices, or healthcare data compliance, please reach out directly:
            </p>
            <div style={{
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '1.25rem',
            }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                HealthPulse Hospital Portal Developer & Administrator:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div><strong>Administrator / Lead Developer:</strong> Adarsh</div>
                <div>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:1975adarsh@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    1975adarsh@gmail.com
                  </a>
                </div>
                <div><strong>Project Repository:</strong> Healthcare Appointment & Clinical Management System</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
