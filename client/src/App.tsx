import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { DoctorVerifyOtp } from './pages/auth/DoctorVerifyOtp';
import { ResetPassword } from './pages/auth/ResetPassword';
import { SetPassword } from './pages/auth/SetPassword';
import { PatientDashboard } from './pages/dashboard/PatientDashboard';
import { DoctorDashboard } from './pages/dashboard/DoctorDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { DoctorSearch } from './pages/patient/DoctorSearch';
import { DoctorDetails } from './pages/patient/DoctorDetails';
import { BookAppointment } from './pages/patient/BookAppointment';
import { MyAppointments } from './pages/patient/MyAppointments';
import { AppointmentDetails } from './pages/patient/AppointmentDetails';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions';
import { PatientBilling } from './pages/patient/PatientBilling';
import { PatientProfile } from './pages/patient/PatientProfile';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorConsultation } from './pages/doctor/DoctorConsultation';
import { ManageDoctors } from './pages/admin/ManageDoctors';
import { CreateDoctor } from './pages/admin/CreateDoctor';
import { EditDoctor } from './pages/admin/EditDoctor';
import { ManageDoctorLeave } from './pages/admin/ManageDoctorLeave';
import { ManageAppointments } from './pages/admin/ManageAppointments';
import { AllDoctorLeaves } from './pages/admin/AllDoctorLeaves';
import { DoctorResetRequests } from './pages/admin/DoctorResetRequests';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/doctor/verify-otp" element={<DoctorVerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Shared Authenticated Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

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
          <Route
            path="/patient/book/:doctorId"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments/:id"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
                <AppointmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPrescriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/billing"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientProfile />
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
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultation/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <DoctorConsultation />
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
          <Route
            path="/admin/doctor-leaves"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AllDoctorLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctor-reset-requests"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DoctorResetRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageAppointments />
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
