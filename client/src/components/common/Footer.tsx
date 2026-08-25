import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Lock, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hp-public-footer" style={{
      backgroundColor: '#0B192C',
      color: '#94A3B8',
      borderTop: '1px solid #1E293B',
      padding: '3rem 1.5rem 2rem',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          {/* Col 1: Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563EB, #0891B2)',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}>
                <HeartPulse size={20} />
              </div>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                HealthPulse Hospital
              </span>
            </div>
            <p style={{ margin: '0 0 1rem', color: '#94A3B8', fontSize: '0.875rem' }}>
              Next-generation healthcare appointment scheduling and clinical consultation platform. Bridging patients and medical providers seamlessly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontSize: '0.8rem' }}>
              <Shield size={14} />
              <span>AES-256 encrypted & HIPAA-aware architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.925rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')} onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}>
                  Home / Overview
                </Link>
              </li>
              <li>
                <Link to="/patient/doctors" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')} onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}>
                  Find Doctors & Specialists
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')} onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}>
                  Sign In to Portal
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')} onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}>
                  Patient Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.925rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Privacy & Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link to="/privacy" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.color = '#38BDF8')} onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <span style={{ color: '#64748B', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                  Google API Services User Data Policy Compliant
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Security */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.925rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Developer & Support
            </h4>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>
              Have questions regarding data security, Google Calendar sync, or your account?
            </p>
            <a
              href="mailto:pranjalkaran2004@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38BDF8',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              <Mail size={14} />
              <span>pranjalkaran2004@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748B',
        }}>
          <div>
            &copy; {currentYear} HealthPulse Healthcare Portal. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
              <Lock size={12} /> SSL Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
