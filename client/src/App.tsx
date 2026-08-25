import React, { lazy, Suspense } from 'react';
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
import { ROLE_DASHBOARD_ROUTES } from './utils/constants';

// Route-Level Code Splitting for Portal Pages
const PatientDashboard = lazy(() => import('./pages/dashboard/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const DoctorDashboard = lazy(() => import('./pages/dashboard/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const DoctorSearch = lazy(() => import('./pages/patient/DoctorSearch').then(m => ({ default: m.DoctorSearch })));
const DoctorDetails = lazy(() => import('./pages/patient/DoctorDetails').then(m => ({ default: m.DoctorDetails })));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment').then(m => ({ default: m.BookAppointment })));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments').then(m => ({ default: m.MyAppointments })));
const AppointmentDetails = lazy(() => import('./pages/patient/AppointmentDetails').then(m => ({ default: m.AppointmentDetails })));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions').then(m => ({ default: m.PatientPrescriptions })));
const PatientBilling = lazy(() => import('./pages/patient/PatientBilling').then(m => ({ default: m.PatientBilling })));
const PatientProfile = lazy(() => import('./pages/patient/PatientProfile').then(m => ({ default: m.PatientProfile })));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile').then(m => ({ default: m.DoctorProfile })));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments').then(m => ({ default: m.DoctorAppointments })));
const DoctorConsultation = lazy(() => import('./pages/doctor/DoctorConsultation').then(m => ({ default: m.DoctorConsultation })));
const ManageDoctors = lazy(() => import('./pages/admin/ManageDoctors').then(m => ({ default: m.ManageDoctors })));
const CreateDoctor = lazy(() => import('./pages/admin/CreateDoctor').then(m => ({ default: m.CreateDoctor })));
const EditDoctor = lazy(() => import('./pages/admin/EditDoctor').then(m => ({ default: m.EditDoctor })));
const ManageDoctorLeave = lazy(() => import('./pages/admin/ManageDoctorLeave').then(m => ({ default: m.ManageDoctorLeave })));
const ManageAppointments = lazy(() => import('./pages/admin/ManageAppointments').then(m => ({ default: m.ManageAppointments })));
const AllDoctorLeaves = lazy(() => import('./pages/admin/AllDoctorLeaves').then(m => ({ default: m.AllDoctorLeaves })));
const DoctorResetRequests = lazy(() => import('./pages/admin/DoctorResetRequests').then(m => ({ default: m.DoctorResetRequests })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

import { PageLoader, FullScreenLoader } from './components/ui/LoadingScreen';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader message="Initializing clinical session..." />;
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
    </div>
  );
};

export default App;
