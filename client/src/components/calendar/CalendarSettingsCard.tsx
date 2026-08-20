import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getCalendarConnectionStatus,
  getGoogleAuthUrl,
  disconnectGoogleCalendar,
} from '../../services/calendarApi';
import { CalendarConnectionStatus } from '../../types/calendar';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const CalendarSettingsCard: React.FC = () => {
  const location = useLocation();

  const [status, setStatus] = useState<CalendarConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCalendarConnectionStatus();
      setStatus(data);
    } catch (err: any) {
      // Non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check for redirect search params from OAuth callback
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('calendar_connected') === 'true') {
      setMessage('Google Calendar successfully linked! Future consultations will be synchronized.');
    }
    if (searchParams.get('calendar_error')) {
      setError(`Google OAuth encountered an issue: ${searchParams.get('calendar_error')}`);
    }
  }, [location.search]);

  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setMessage(null);
      const authUrl = await getGoogleAuthUrl();
      // Redirect user to Google OAuth consent screen
      window.location.href = authUrl;
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to initiate Google Calendar connection.'
      );
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setMessage(null);
      await disconnectGoogleCalendar();
      setStatus({ isConnected: false, googleAccountEmail: '' });
      setMessage('Google Calendar disconnected successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Google Calendar.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card calendar-settings-card">
      <div className="calendar-settings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="calendar-icon-badge">
            <Calendar size={22} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              Google Calendar Synchronization
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Automatically sync your appointments and consultations to your Google Calendar
            </span>
          </div>
        </div>

        {status && status.isConnected ? (
          <span className="calendar-status-badge badge-connected">
            <CheckCircle2 size={13} />
            <span>Connected</span>
          </span>
        ) : (
          <span className="calendar-status-badge badge-disconnected">
            Not Connected
          </span>
        )}
      </div>

      {message && (
        <div className="alert alert-success" style={{ margin: '1rem 0 0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ margin: '1rem 0 0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="calendar-settings-body">
        {isLoading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }} />
          </div>
        ) : status && status.isConnected ? (
          <div className="calendar-connected-box">
            <div className="calendar-account-info">
              <span className="cal-label">Linked Account:</span>
              <strong className="cal-email">{status.googleAccountEmail || 'Google Account'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={15} color="#10b981" />
              <span>
                Automatic 2-way event syncing is active. Cancelled and rescheduled visits update automatically.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-danger-outline btn-sm"
                onClick={handleDisconnect}
                disabled={isProcessing}
              >
                <LogOut size={14} />
                <span>Disconnect Calendar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="calendar-disconnected-box">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Connect your Google Calendar to synchronize scheduled consultation slots, receive Google Calendar reminders, and access appointment timing across all your devices.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConnect}
                disabled={isProcessing}
                style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)' }}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} />
                    <span>Connect Google Calendar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
