import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { DoctorSearch } from './pages/patient/DoctorSearch';
import { DoctorDetails } from './pages/patient/DoctorDetails';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { ManageDoctors } from './pages/admin/ManageDoctors';
import { CreateDoctor } from './pages/admin/CreateDoctor';
import { EditDoctor } from './pages/admin/EditDoctor';
import { ManageDoctorLeave } from './pages/admin/ManageDoctorLeave';
import { ROLE_DASHBOARD_ROUTES } from './utils/constants';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_DASHBOARD_ROUTES[user.role] || '/login'} replace />;
  }

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Default Root */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <DoctorSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors/:id"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <DoctorDetails />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/create"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EditDoctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id/leave"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageDoctorLeave />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
