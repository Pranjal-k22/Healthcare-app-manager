import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getCalendarConnectionStatus,
  getGoogleAuthUrl,
  disconnectGoogleCalendar,
} from '../../services/calendarApi';
import { CalendarConnectionStatus } from '../../types/calendar';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import InlineAlert from '../ui/InlineAlert';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import {
  Calendar,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const CalendarSettingsCard: React.FC = () => {
  const location = useLocation();
  const { success, error: toastError } = useToast();

  const [status, setStatus] = useState<CalendarConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
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
    const isConnectedParam =
      searchParams.get('calendar_connected') === 'true' ||
      searchParams.get('calendar') === 'connected';
    const errorParam =
      searchParams.get('calendar_error') ||
      (searchParams.get('calendar') === 'error' ? 'Connection was cancelled or failed' : null);

    if (isConnectedParam) {
      const successMsg = 'Google Calendar successfully linked! Future consultations will be synchronized.';
      setMessage(successMsg);
      success(successMsg, 'Calendar Linked');
      fetchStatus();
      // Clean query params from URL bar so it doesn't persist on page refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (errorParam) {
      const errMsg = `Google OAuth encountered an issue: ${errorParam}`;
      setError(errMsg);
      toastError(errMsg, 'OAuth Error');
      // Clean query params from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
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
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to initiate Google Calendar connection.';
      setError(errMsg);
      toastError(errMsg, 'Connection Error');
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
      success('Google Calendar disconnected.', 'Disconnected');
      setShowDisconnectConfirm(false);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to disconnect Google Calendar.';
      setError(errMsg);
      toastError(errMsg, 'Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card noPadding style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 198, 255, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <h3 className="card-title" style={{ margin: 0 }}>
                  Google Calendar Synchronization
                </h3>
                <p className="helper-text" style={{ marginTop: '2px' }}>
                  Automatically sync your scheduled appointments and consultations to your Google Calendar
                </p>
              </div>
            </div>

            <div>
              {status && status.isConnected ? (
                <StatusBadge status="ACTIVE" label="Connected" size="sm" />
              ) : (
                <StatusBadge status="EXPIRED" label="Not Connected" size="sm" />
              )}
            </div>
          </div>

          {/* Feedback Alerts */}
          {message && (
            <InlineAlert
              type="success"
              message={message}
              onClose={() => setMessage(null)}
            />
          )}

          {error && (
            <InlineAlert
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {/* Card Body */}
          {isLoading ? (
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
              <div className="btn-spinner" style={{ width: '24px', height: '24px', margin: '0 auto', borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : status && status.isConnected ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Linked Google Account</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {status.googleAccountEmail || 'Google Account Active'}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectConfirm(true)}
                  disabled={isProcessing}
                  leftIcon={<LogOut size={14} />}
                  style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                >
                  Disconnect Calendar
                </Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Automatic 2-way event syncing is active. Cancelled or rescheduled visits update automatically.</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="body-text" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Connect your Google Calendar to synchronize scheduled consultation slots, receive Google Calendar reminders, and access appointment timing across all your devices.
              </p>

              <div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleConnect}
                  isLoading={isProcessing}
                  leftIcon={<ExternalLink size={15} />}
                >
                  Connect Google Calendar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDisconnectConfirm}
        title="Disconnect Google Calendar"
        message="Are you sure you want to disconnect your Google Calendar? New appointments will no longer be synchronized automatically."
        confirmLabel="Yes, Disconnect"
        cancelLabel="Keep Connected"
        variant="warning"
        isLoading={isProcessing}
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
      />
    </>
  );
};

export default CalendarSettingsCard;
