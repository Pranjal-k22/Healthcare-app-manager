import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Shield, Lock, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hp-public-footer">
      <div className="hp-footer-inner">
        <div className="hp-footer-grid">
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
                flexShrink: 0,
              }}>
                <HeartPulse size={18} />
              </div>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                HealthPulse Hospital
              </span>
            </div>
            <p style={{ margin: '0 0 0.85rem', color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.55 }}>
              Next-generation healthcare appointment scheduling and clinical consultation platform. Bridging patients and medical providers seamlessly.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontSize: '0.785rem' }}>
              <Shield size={13} style={{ flexShrink: 0 }} />
              <span>AES-256 encrypted &amp; HIPAA-aware architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Home / Overview
                </Link>
              </li>
              <li>
                <Link to="/patient/doctors" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Find Doctors &amp; Specialists
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Sign In to Portal
                </Link>
              </li>
              <li>
                <Link to="/register" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Patient Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Trust */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Privacy &amp; Legal
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <li>
                <Link to="/privacy" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <span style={{ color: '#64748B', fontSize: '0.78rem', display: 'block', marginTop: '0.2rem' }}>
                  Google API Services User Data Policy Compliant
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Security */}
          <div>
            <h4 style={{ color: '#F1F5F9', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Support &amp; Contact
            </h4>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.85rem', color: '#94A3B8' }}>
              Have questions regarding data security, Google Calendar sync, or your account?
            </p>
            <a
              href="mailto:1975adarsh@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38BDF8',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              <Mail size={14} style={{ flexShrink: 0 }} />
              <span>1975adarsh@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="hp-footer-bottom">
          <div>
            &copy; {currentYear} HealthPulse Healthcare Portal. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
