import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  History,
  CreditCard,
  User,
  Stethoscope,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Pill,
  CalendarDays,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ConfirmDialog from './ConfirmDialog';
import Avatar from './Avatar';


export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string | number;
  exact?: boolean;
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
    { label: 'Dashboard', to: '/patient/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { label: 'Book Appointment', to: '/patient/doctors', icon: <CalendarPlus size={18} /> },
    { label: 'My Appointments', to: '/patient/appointments', icon: <History size={18} /> },
    { label: 'Prescriptions', to: '/patient/prescriptions', icon: <Pill size={18} /> },
    { label: 'Billing & Invoices', to: '/patient/billing', icon: <CreditCard size={18} /> },
    { label: 'My Profile', to: '/patient/profile', icon: <User size={18} /> },
  ];

  const getDoctorNavItems = (): NavItem[] => [
    { label: 'Dashboard', to: '/doctor/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { label: 'Consultation Queue', to: '/doctor/appointments', icon: <Calendar size={18} /> },
    { label: 'Clinical Profile & Hours', to: '/doctor/profile', icon: <User size={18} /> },
  ];

  const getAdminNavItems = (): NavItem[] => [
    { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { label: 'Manage Doctors', to: '/admin/doctors', icon: <Stethoscope size={18} />, exact: true },
    { label: 'Add New Doctor', to: '/admin/doctors/new', icon: <UserPlus size={18} /> },
    { label: 'Clinic Appointments', to: '/admin/appointments', icon: <Calendar size={18} /> },
    { label: 'Doctor Leaves', to: '/admin/doctor-leaves', icon: <CalendarDays size={18} /> },
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

  const getProfileRoute = () => {
    switch (role) {
      case 'DOCTOR':
        return '/doctor/profile';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'PATIENT':
      default:
        return '/patient/profile';
    }
  };

  return (
    <>
      <aside
        className={`sidebar-ui ${isCollapsed ? 'is-collapsed' : ''}`}
      >
        {/* Sidebar Header / User Card */}
        <div className="sidebar-user-header">
          <Link
            to={getProfileRoute()}
            title="View & Edit Account Profile"
            className="sidebar-user-link"
          >
            <Avatar
              name={user?.name || 'User'}
              seed={user?._id || user?.email}
              size="md"
            />

            {!isCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">
                  {user?.name || 'User'}
                </div>
                <div className="sidebar-user-action">
                  View Profile →
                </div>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="sidebar-collapse-btn"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation Link List */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'is-active' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">
                {item.icon}
              </span>
              {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="sidebar-nav-badge">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Sign out' : undefined}
            className="sidebar-logout-btn"
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
