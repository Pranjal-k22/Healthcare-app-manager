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
  Bell,
  CheckCheck,
  Clock,
  Pill,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';

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
        ? notification.relatedAppointmentId?._id ||
          notification.relatedAppointmentId?.id
        : notification.relatedAppointmentId;

    if (appId) {
      if (user?.role === 'DOCTOR') {
        navigate(`/doctor/consultation/${appId}`);
      } else if (user?.role === 'PATIENT') {
        navigate(`/patient/appointments/${appId}`);
      } else {
        navigate('/admin/appointments');
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_BOOKED':
      case 'APPOINTMENT_CONFIRMED':
        return <Clock size={20} color="#10b981" />;
      case 'APPOINTMENT_CANCELLED':
        return <XCircle size={20} color="#fb7185" />;
      case 'APPOINTMENT_RESCHEDULED':
        return <RefreshCw size={20} color="#38bdf8" />;
      case 'PRESCRIPTION_AVAILABLE':
        return <Pill size={20} color="#a855f7" />;
      case 'APPOINTMENT_REMINDER':
      default:
        return <Bell size={20} color="#f59e0b" />;
    }
  };

  return (
    <div className="container dashboard-container" style={{ maxWidth: '820px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
            Notifications
          </h1>
          <p className="welcome-subtitle">
            System alerts, schedule updates, and consultation reminders.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleMarkAllRead}
        >
          <CheckCheck size={15} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="search-bar-container" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('ALL')}
          >
            All Alerts
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter('UNREAD')}
          >
            Unread
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: '36px', height: '36px' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Loading notification records...
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card empty-state-card">
          <Bell size={40} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Notifications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {filter === 'UNREAD'
              ? 'You have caught up with all your unread alerts.'
              : 'You do not have any notification records right now.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`glass-card notification-card-full ${!n.isRead ? 'unread-full' : ''}`}
              onClick={() => handleItemClick(n)}
            >
              <div className="notif-full-icon">{getIconForType(n.type)}</div>

              <div className="notif-full-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>

              <div className="notif-full-actions">
                {!n.isRead && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.3rem 0.5rem' }}
                    onClick={(e) => handleMarkSingleRead(n.id, e)}
                    title="Mark as read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  style={{ padding: '0.3rem 0.5rem' }}
                  onClick={(e) => handleDelete(n.id, e)}
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
