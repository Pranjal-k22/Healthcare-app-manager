import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationApi';
import { NotificationItem } from '../../types/notification';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Pill,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count every 30 seconds
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Non-blocking background error
    }
  };

  const fetchDropdownNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await getNotifications({ limit: 6 });
      setNotifications(data.notifications);
    } catch (err) {
      // Non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch items when opening dropdown
  useEffect(() => {
    if (isOpen) {
      fetchDropdownNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      // Non-blocking
    }
  };

  const handleItemClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        // Non-blocking
      }
    }

    setIsOpen(false);

    // Route navigation based on notification role & type
    const appId = typeof notification.relatedAppointmentId === 'object'
      ? notification.relatedAppointmentId?._id || notification.relatedAppointmentId?.id
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
        return <Clock size={16} color="#10b981" />;
      case 'APPOINTMENT_CANCELLED':
        return <XCircle size={16} color="#fb7185" />;
      case 'APPOINTMENT_RESCHEDULED':
        return <RefreshCw size={16} color="#38bdf8" />;
      case 'PRESCRIPTION_AVAILABLE':
        return <Pill size={16} color="#a855f7" />;
      case 'APPOINTMENT_REMINDER':
      default:
        return <Bell size={16} color="#f59e0b" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown glass-card">
          <div className="notification-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notification-dropdown-body">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px' }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  You have no notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className="notification-item-icon">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-title-row">
                      <strong className="notification-title">{notif.title}</strong>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="notification-message">{notif.message}</p>
                  </div>
                  {!notif.isRead && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Link
              to="/notifications"
              className="view-all-notifications-link"
              onClick={() => setIsOpen(false)}
            >
              <span>View All Notifications</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
