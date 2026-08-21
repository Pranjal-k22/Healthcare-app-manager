import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  History,
  FileText,
  CreditCard,
  User,
  Users,
  Stethoscope,
  Clock,
  Search,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Pill,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from './ConfirmDialog';

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getPatientNavItems = (): NavItem[] => [
    { label: 'Dashboard', to: '/patient/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Book Appointment', to: '/patient/doctors', icon: <CalendarPlus size={18} /> },
    { label: 'Appointment History', to: '/patient/appointments', icon: <History size={18} /> },
    { label: 'Prescriptions', to: '/patient/prescriptions', icon: <Pill size={18} /> },
    { label: 'Billing', to: '/patient/billing', icon: <CreditCard size={18} /> },
    { label: 'Profile', to: '/patient/profile', icon: <User size={18} /> },
  ];

  const getDoctorNavItems = (): NavItem[] => [
    { label: 'Dashboard', to: '/doctor/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: "Today's Appointments", to: '/doctor/appointments', icon: <Calendar size={18} /> },
    { label: 'All Appointments', to: '/doctor/appointments', icon: <History size={18} /> },
    { label: 'Patient Search', to: '/doctor/appointments', icon: <Search size={18} /> },
    { label: 'Prescriptions', to: '/doctor/appointments', icon: <FileText size={18} /> },
    { label: 'Availability', to: '/doctor/profile', icon: <Clock size={18} /> },
    { label: 'Profile', to: '/doctor/profile', icon: <User size={18} /> },
  ];

  const getAdminNavItems = (): NavItem[] => [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Patients', to: '/admin/appointments', icon: <Users size={18} /> },
    { label: 'Doctors', to: '/admin/doctors', icon: <Stethoscope size={18} /> },
    { label: 'Appointments', to: '/admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Prescriptions', to: '/admin/appointments', icon: <FileText size={18} /> },
    { label: 'Feedback', to: '/admin/dashboard#feedback', icon: <MessageSquare size={18} /> },
    { label: 'Reports', to: '/admin/dashboard#reports', icon: <BarChart3 size={18} /> },
    { label: 'Settings', to: '/admin/dashboard#settings', icon: <Settings size={18} /> },
  ];

  const navItems =
    role === 'ADMIN'
      ? getAdminNavItems()
      : role === 'DOCTOR'
      ? getDoctorNavItems()
      : getPatientNavItems();

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar-ui ${isCollapsed ? 'is-collapsed' : ''}`}>
        {/* Sidebar Header / User Card */}
        <div className="sidebar-user-block">
          <div className="sidebar-avatar">
            {role === 'ADMIN' ? (
              <Shield size={20} color="var(--primary-dark)" />
            ) : role === 'DOCTOR' ? (
              <Stethoscope size={20} color="var(--primary)" />
            ) : (
              <User size={20} color="var(--primary)" />
            )}
          </div>
          {!isCollapsed && (
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name button-text">{user?.name || 'User'}</div>
              <div className="sidebar-user-role helper-text">{role} Portal</div>
            </div>
          )}
          {onToggleCollapse && (
            <button
              className="sidebar-collapse-toggle"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Link List */}
        <nav className="sidebar-nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'is-active' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of your healthcare portal session?"
        confirmLabel="Yes, Sign Out"
        cancelLabel="Stay Logged In"
        variant="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Sidebar;
