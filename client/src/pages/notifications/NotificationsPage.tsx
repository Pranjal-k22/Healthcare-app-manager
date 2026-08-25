import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../services/notificationApi';
import { NotificationItem } from '../../types/notification';
import { useAuth } from '../../hooks/useAuth';
import {
  AlertCircle,
  Calendar,
  CheckCheck,
  Clock,
  Pill,
  RefreshCw,
  Trash2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Skeleton';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNotifications({
        isRead: filter === 'UNREAD' ? false : undefined,
        limit: 50,
      });
      setNotifications(data.notifications);
    } catch (err: any) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filter]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notifications as read.');
    }
  };

  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update notification.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification.');
    }
  };

  const handleItemClick = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id).catch(() => {});
    }

    const appId =
      typeof notification.relatedAppointmentId === 'object'
        ? notification.relatedAppointmentId?._id || notification.relatedAppointmentId?.id
        : notification.relatedAppointmentId;

    if (appId) {
      if (user?.role === 'DOCTOR') {
        navigate(`/doctor/schedule`);
      } else if (user?.role === 'PATIENT') {
        navigate(`/patient/appointments`);
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_CONFIRMED':
        return (
          <div className="notif-icon-pill notif-icon-success">
            <Calendar size={18} />
          </div>
        );
      case 'APPOINTMENT_CANCELLED':
        return (
          <div className="notif-icon-pill notif-icon-danger">
            <XCircle size={18} />
          </div>
        );
      case 'APPOINTMENT_RESCHEDULED':
        return (
          <div className="notif-icon-pill notif-icon-info">
            <RefreshCw size={18} />
          </div>
        );
      case 'PRESCRIPTION_AVAILABLE':
      case 'MEDICATION_REMINDER':
        return (
          <div className="notif-icon-pill notif-icon-purple">
            <Pill size={18} />
          </div>
        );
      case 'APPOINTMENT_REMINDER':
      default:
        return (
          <div className="notif-icon-pill notif-icon-warning">
            <Clock size={18} />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container" style={{ maxWidth: '860px', padding: '2rem 1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Notifications & Alerts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
            System updates, consultation schedules, and medication reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck size={14} />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          background: 'var(--surface)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          className={`segmented-tab-btn ${filter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          className={`segmented-tab-btn ${filter === 'UNREAD' ? 'is-active' : ''}`}
          onClick={() => setFilter('UNREAD')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {error && (
        <div className="alert-inline alert-inline-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* List / Skeleton / Empty State */}
      {isLoading ? (
        <div className="skeleton-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="empty-state-card-ui">
          <div className="empty-state-icon-circle">
            <Sparkles size={28} />
          </div>
          <h3 className="empty-state-title">
            {filter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Found'}
          </h3>
          <p className="empty-state-desc">
            {filter === 'UNREAD'
              ? "You've read all your recent notifications."
              : 'You have no notifications on record at this time.'}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-page-card ${!n.isRead ? 'is-unread' : ''}`}
              onClick={() => handleItemClick(n)}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{renderIcon(n.type)}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: n.isRead ? 600 : 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {n.message.replace(/Dr\.\s+Dr\./g, 'Dr.')}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  flexShrink: 0,
                  marginLeft: '0.5rem',
                }}
              >
                {!n.isRead && (
                  <button
                    type="button"
                    className="notif-action-btn"
                    onClick={(e) => handleMarkSingleRead(n.id, e)}
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <CheckCheck size={15} color="var(--primary)" />
                  </button>
                )}
                <button
                  type="button"
                  className="notif-action-btn notif-delete-btn"
                  onClick={(e) => handleDelete(n.id, e)}
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
