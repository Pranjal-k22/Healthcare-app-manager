import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

  return (
    <>
      <aside
        style={{
          width: isCollapsed ? '72px' : '260px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '100vh',
          transition: 'width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Sidebar Header / User Card */}
        <div
          style={{
            padding: '1.25rem 1rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Avatar
            name={user?.name || 'User'}
            seed={user?._id || user?.email}
            size="md"
          />

          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {role} Portal
              </div>
            </div>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Navigation Link List */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '12px 10px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label + item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '10px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0062cc' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                borderLeft: isActive ? '3.5px solid #0062cc' : '3.5px solid transparent',
                transition: 'all 0.15s ease',
              })}
              title={isCollapsed ? item.label : undefined}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: '#0062cc',
                    color: '#ffffff',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? 'Sign out' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid transparent',
              background: 'transparent',
              color: '#dc2626',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
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
