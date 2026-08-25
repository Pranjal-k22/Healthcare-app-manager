import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import {
  LayoutDashboard,
  Calendar,
  User,
  Stethoscope,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = user?.role || 'PATIENT';

  const getMobileNavLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', to: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Doctors', to: '/admin/doctors', icon: <Stethoscope size={20} /> },
          { label: 'Appointments', to: '/admin/appointments', icon: <Calendar size={20} /> },
          { label: 'Notifications', to: '/notifications', icon: <Users size={20} /> },
        ];
      case 'DOCTOR':
        return [
          { label: 'Dashboard', to: '/doctor/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Appointments', to: '/doctor/appointments', icon: <Calendar size={20} /> },
          { label: 'Profile', to: '/doctor/profile', icon: <User size={20} /> },
          { label: 'Alerts', to: '/notifications', icon: <Users size={20} /> },
        ];
      case 'PATIENT':
      default:
        return [
          { label: 'Dashboard', to: '/patient/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Book', to: '/patient/doctors', icon: <Calendar size={20} /> },
          { label: 'Appointments', to: '/patient/appointments', icon: <Users size={20} /> },
          { label: 'Profile', to: '/patient/profile', icon: <User size={20} /> },
        ];
    }
  };

  return (
    <div className="dashboard-layout-container">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        role={role}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`dashboard-main-viewport ${isCollapsed ? 'sidebar-is-collapsed' : ''}`}>
        <div className="dashboard-content-scroll">{children}</div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="dashboard-mobile-bottom-nav">
        {getMobileNavLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            data-testid={link.to === '/admin/doctors' ? 'admin-doctors-link' : undefined}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="mobile-nav-icon">{link.icon}</span>
            <span className="mobile-nav-label helper-text">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
