import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PublicLayout } from './components/public/PublicLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { AboutUs } from './pages/public/AboutUs';
import { ServicesPage } from './pages/public/ServicesPage';
import { SingleService } from './pages/public/SingleService';
import { DoctorsPage } from './pages/public/DoctorsPage';
import { NewsPage } from './pages/public/NewsPage';
import { SingleNews } from './pages/public/SingleNews';
import { ContactPage } from './pages/public/ContactPage';
import { PublicAppointmentPage } from './pages/public/PublicAppointmentPage';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { DoctorVerifyOtp } from './pages/auth/DoctorVerifyOtp';
import { ResetPassword } from './pages/auth/ResetPassword';
import { SetPassword } from './pages/auth/SetPassword';

// Portal Dashboards & Protected Pages
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

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Meddical Clinic Website Routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/services/:id" element={<PublicLayout><SingleService /></PublicLayout>} />
      <Route path="/doctors" element={<PublicLayout><DoctorsPage /></PublicLayout>} />
      <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
      <Route path="/news/:id" element={<PublicLayout><SingleNews /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/appointment" element={<PublicLayout><PublicAppointmentPage /></PublicLayout>} />

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
            <div className="app-container">
              <Navbar />
              <main className="main-content"><NotificationsPage /></main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Protected Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><PatientDashboard /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/doctors"
        element={
          <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorSearch /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/doctors/:id"
        element={
          <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorDetails /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book/:doctorId"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><BookAppointment /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><MyAppointments /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments/:id"
        element={
          <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><AppointmentDetails /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><PatientPrescriptions /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/billing"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><PatientBilling /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><PatientProfile /></main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Protected Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorDashboard /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorProfile /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorAppointments /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/consultation/:appointmentId"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorConsultation /></main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><AdminDashboard /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><ManageDoctors /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><CreateDoctor /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><EditDoctor /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors/:id/leave"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><ManageDoctorLeave /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctor-leaves"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><AllDoctorLeaves /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctor-reset-requests"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><DoctorResetRequests /></main>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="app-container">
              <Navbar />
              <main className="main-content"><ManageAppointments /></main>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
