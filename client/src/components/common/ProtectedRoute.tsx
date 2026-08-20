import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { ROLE_DASHBOARD_ROUTES } from '../../utils/constants';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Verifying secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but does not possess the required role
    const defaultDashboard = ROLE_DASHBOARD_ROUTES[user.role] || '/login';
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
};
