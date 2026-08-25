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
    <div className="hp-landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      
      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0F2744 0%, #1E3A8A 50%, #0F766E 100%)',
        color: '#ffffff',
        padding: '5rem 1.5rem 6rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle decorative grid background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#E0F2FE',
            marginBottom: '1.75rem',
          }}>
            <Sparkles size={16} color="#38BDF8" />
            <span>Intelligent Healthcare Scheduling &amp; Clinical Management</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}>
            {/* Hero Left Copy */}
            <div>
              <h1 style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                color: '#ffffff',
              }}>
                Healthcare, connected. <br />
                <span style={{
                  background: 'linear-gradient(to right, #38BDF8, #818CF8, #34D399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Simple. Secure. Smart.
                </span>
              </h1>

              <p style={{
                fontSize: '1.125rem',
                lineHeight: 1.6,
                color: '#E2E8F0',
                marginBottom: '2rem',
                maxWidth: '560px',
              }}>
                HealthPulse unites patients, doctors, and hospital administrators in one streamlined portal. Book doctor appointments in seconds, sync schedules seamlessly with Google Calendar, and manage medical prescriptions with enterprise-grade security.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                {isAuthenticated ? (
                  <Link to={dashboardRoute}>
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
                    <Link to="/patient/doctors">
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
                    <Link to="/login">
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
                    <Link to="/register">
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '2.5rem',
                fontSize: '0.85rem',
                color: '#CBD5E1',
              }}>
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
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <HeartPulse size={20} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>HealthPulse Hospital</h3>
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
                }}>
                  Operational
                </span>
              </div>

              {/* Sample appointment cards preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Stethoscope size={20} color="#2563EB" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>Cardiology Consultation</div>
                      <div style={{ fontSize: '0.775rem', color: '#64748B' }}>Dr. Sharma &bull; Confirmed Slot</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>10:30 AM</div>
                    <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                      <Calendar size={10} /> Synced to Google
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileCheck size={20} color="#059669" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>Digital Prescription Ready</div>
                      <div style={{ fontSize: '0.775rem', color: '#64748B' }}>Verified with dosage notes</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES SECTION ────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Comprehensive Clinical Workflow
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
            Engineered from the ground up for hospitals, private clinics, doctors, and patients.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {/* Card 1 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Search size={24} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
              Doctor Discovery &amp; Search
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
              Search specialist physicians by department, consultation fee, experience, and real-time available time slots.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Calendar size={24} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
              Google Calendar 2-Way Sync
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
              Directly sync your confirmed appointments to your Google Calendar. Get automatic popup and email notifications before each visit.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Stethoscope size={24} color="#D97706" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
              Clinical Consultations &amp; Rx
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
              Doctors record clinical notes, diagnoses, and digital prescriptions with full historical tracking and printable invoices.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={24} color="#9333EA" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
              Role-Based Access Control
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
              Dedicated, purpose-built portals for Patients, Medical Doctors, and Hospital Administrators with strict boundary enforcement.
            </p>
          </div>
        </div>
      </section>

      {/* ── GOOGLE INTEGRATION & SECURITY TRANSPARENCY SECTION ────────────── */}
      <section style={{ backgroundColor: '#ffffff', padding: '5rem 1.5rem', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                backgroundColor: '#2563EB',
                borderRadius: '10px',
                padding: '8px',
                color: '#ffffff',
                display: 'flex',
              }}>
                <Shield size={22} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                Google OAuth &amp; Calendar Integration Transparency
              </h2>
            </div>

            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              HealthPulse integrates with Google APIs solely to enhance your healthcare appointment scheduling experience. We uphold rigorous security practices in accordance with Google's API Services User Data Policy.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
            }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  Requested OAuth Scope
                </h4>
                <code style={{ fontSize: '0.8rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                  calendar.events
                </code>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                  Used strictly to create, update, and manage appointment event reminders on your primary Google Calendar.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  Encrypted Token Storage
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  AES-256-GCM Encryption
                </span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                  Your Google OAuth tokens are securely encrypted at rest. Plaintext tokens are never exposed to browser clients.
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.95rem', fontWeight: 700, color: '#1E293B' }}>
                  Limited Use &amp; Zero Ads
                </h4>
                <span style={{ fontSize: '0.8rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Zero Data Monetization
                </span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                  We never transfer, sell, or use Google user data for advertising, marketing, or general AI model training.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
            }}>
              <span style={{ fontSize: '0.9rem', color: '#1E40AF', fontWeight: 500 }}>
                Learn more about how we safeguard your information and manage consent:
              </span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to="/privacy"
                  style={{
                    color: '#2563EB',
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
                    color: '#475569',
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
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
          Ready to experience seamless healthcare scheduling?
        </h2>
        <p style={{ color: '#64748B', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Sign in or create a patient account to browse doctors, book consultations, and manage your medical care online.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              style={{
                backgroundColor: '#2563EB',
                fontWeight: 700,
                padding: '0.85rem 2rem',
              }}
            >
              Register as New Patient
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="outline"
              size="lg"
              style={{
                fontWeight: 600,
                padding: '0.85rem 2rem',
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
