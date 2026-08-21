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
  Calendar,
  CheckCheck,
  Clock,
  ExternalLink,
  Pill,
  RefreshCw,
  XCircle,
  Sparkles,
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper for relative timestamps
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 172800) return 'Yesterday';
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Helper to clean duplicate Dr. Dr.
  const cleanMessage = (msg: string) => {
    if (!msg) return '';
    return msg.replace(/Dr\.\s+Dr\./g, 'Dr.');
  };

  // Poll unread count every 30s
  const fetchUnread = async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Non-blocking
    }
  };

  const fetchDropdownItems = async () => {
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
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownItems();
      fetchUnread();
    }
  }, [isOpen]);

  // Click outside & ESC key listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
            <Calendar size={15} />
          </div>
        );
      case 'APPOINTMENT_CANCELLED':
        return (
          <div className="notif-icon-pill notif-icon-danger">
            <XCircle size={15} />
          </div>
        );
      case 'APPOINTMENT_RESCHEDULED':
        return (
          <div className="notif-icon-pill notif-icon-info">
            <RefreshCw size={15} />
          </div>
        );
      case 'PRESCRIPTION_AVAILABLE':
      case 'MEDICATION_REMINDER':
        return (
          <div className="notif-icon-pill notif-icon-purple">
            <Pill size={15} />
          </div>
        );
      case 'APPOINTMENT_REMINDER':
      default:
        return (
          <div className="notif-icon-pill notif-icon-warning">
            <Clock size={15} />
          </div>
        );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className={`notif-bell-trigger-btn ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown-menu" role="menu">
          {/* Header */}
          <div className="notif-dropdown-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="notif-dropdown-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} new</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark-all-btn"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body Items List */}
          <div className="notif-dropdown-body">
            {isLoading ? (
              <div className="notif-loading-state">
                <div
                  className="btn-spinner"
                  style={{
                    width: '22px',
                    height: '22px',
                    margin: '0 auto 0.5rem auto',
                    borderColor: 'var(--primary)',
                    borderTopColor: 'transparent',
                  }}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Loading alerts...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon-circle">
                  <Sparkles size={20} color="var(--primary)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  All caught up!
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  You have no pending notifications.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-card-item ${!notif.isRead ? 'is-unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                  role="menuitem"
                >
                  <div className="notif-item-left">
                    {renderIcon(notif.type)}
                  </div>

                  <div className="notif-item-main">
                    <div className="notif-item-row">
                      <span className="notif-item-title">{notif.title}</span>
                      <span className="notif-item-time">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="notif-item-message">
                      {cleanMessage(notif.message)}
                    </p>
                  </div>

                  {!notif.isRead && <span className="notif-item-unread-dot" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notif-dropdown-footer">
            <Link
              to="/notifications"
              className="notif-view-all-link"
              onClick={() => setIsOpen(false)}
            >
              <span>View All Notifications</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
