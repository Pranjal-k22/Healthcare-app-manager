import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCalendarConnectionStatus, getGoogleAuthUrl } from '../../services/calendarApi';
import { CalendarConnectionStatus } from '../../types/calendar';
import { Calendar, CalendarCheck, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';

export const NavCalendarButton: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [status, setStatus] = useState<CalendarConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await getCalendarConnectionStatus();
      setStatus(data);
    } catch (err) {
      // Non-blocking
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus, location.search]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsConnecting(true);
      const authUrl = await getGoogleAuthUrl();
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        toastError('Could not retrieve Google OAuth authorization URL', 'OAuth Error');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to connect Google Calendar';
      toastError(errMsg, 'Connection Error');
    } finally {
      setIsConnecting(false);
    }
  };

  const getProfileRoute = () => {
    switch (user.role) {
      case 'DOCTOR':
        return '/doctor/profile';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'PATIENT':
      default:
        return '/patient/profile';
    }
  };

  const isConnected = status && status.isConnected;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {isLoading ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fontSize: '12.5px',
            color: '#ffffff',
          }}
        >
          <div className="spinner" style={{ width: '12px', height: '12px' }} />
          <span>Calendar</span>
        </div>
      ) : isConnected ? (
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '5px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34D399',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={`Google Calendar Connected: ${status.googleAccountEmail || user.email}`}
        >
          <CalendarCheck size={14} color="#10B981" />
          <span>Calendar Connected</span>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '5px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            color: '#FBBF24',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Click to link your Google Calendar for automated event sync"
        >
          {isConnecting ? (
            <RefreshCw size={14} className="spin" color="#FBBF24" />
          ) : (
            <Calendar size={14} color="#FBBF24" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Calendar'}</span>
          <ExternalLink size={12} color="#FBBF24" />
        </button>
      )}

      {/* Dropdown for Connected State */}
      {showDropdown && isConnected && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-light)',
            padding: '12px 14px',
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '8px' }}>
            <CheckCircle2 size={16} color="#10B981" />
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
              Google Calendar Linked
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: '10px' }}>
            {status.googleAccountEmail || user.email}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
            Appointments, reschedules, and cancellations are automatically synchronized.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                navigate(getProfileRoute());
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', padding: 0 }}
            >
              Manage in Profile
            </button>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavCalendarButton;
