import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyAppointments, cancelAppointment } from '../../services/appointmentApi';
import { Appointment } from '../../types/appointment';
import DashboardLayout from '../../components/ui/DashboardLayout';
import SummaryStatCard from '../../components/ui/SummaryStatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { MedicationReminderList } from '../../components/patient/MedicationReminderList';
import { formatDateIndian, formatTimeIndian } from '../../utils/dateUtils';
import {
  CalendarCheck,
  CheckCircle2,
  Pill,
  CreditCard,
  Search,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  XCircle,
  FileText,
  User,
  PlusCircle,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.warn('Failed to load patient appointments', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcomingAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const handleConfirmCancel = async () => {
    if (!cancelModalAppointmentId) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(cancelModalAppointmentId);
      success('Appointment was cancelled successfully.', 'Cancelled');
      setCancelModalAppointmentId(null);
      await fetchAppointments();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel appointment', 'Action Failed');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="patient-dashboard-view">
        {/* Welcome Header */}
        <div className="dashboard-header-row">
          <div>
            <h1 className="welcome-title">
              Welcome, {user?.name}
              <span className="role-badge badge-patient">
                <User size={12} /> Patient
              </span>
            </h1>
            <p className="welcome-subtitle">
              Manage your healthcare visits, specialist appointments, and medication tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/patient/doctors">
              <Button variant="primary" size="md" leftIcon={<Search size={16} />}>
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Top Summary Stat Cards */}
        <div className="stats-grid">
          <SummaryStatCard
            label="Upcoming Appointments"
            value={upcomingAppointments.length}
            icon={<CalendarCheck size={22} />}
            iconBgColor="rgba(0, 98, 204, 0.08)"
            iconColor="var(--primary)"
            subtext="Confirmed & Active"
          />
          <SummaryStatCard
            label="Completed Consultations"
            value={completedAppointments.length}
            icon={<CheckCircle2 size={22} />}
            iconBgColor="var(--success-bg)"
            iconColor="var(--success)"
            subtext="Care history on file"
          />
          <SummaryStatCard
            label="Active Prescriptions"
            value="3"
            icon={<Pill size={22} />}
            iconBgColor="var(--info-bg)"
            iconColor="var(--info)"
            subtext="Daily dosage scheduled"
          />
          <SummaryStatCard
            label="Outstanding Balance"
            value="$0.00"
            icon={<CreditCard size={22} />}
            iconBgColor="rgba(57, 49, 175, 0.08)"
            iconColor="var(--primary-dark)"
            subtext="All accounts settled"
          />
        </div>

        {/* Highlight Block: Next Appointment */}
        {nextAppointment ? (
          <div className="next-appointment-hero-card">
            <div className="next-appt-meta">
              <div className="next-appt-avatar">
                <Stethoscope size={28} />
              </div>
              <div className="next-appt-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                  <span className="helper-text" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: 'var(--primary)' }}>
                    Next Scheduled Appointment
                  </span>
                  <StatusBadge status={nextAppointment.status} size="sm" />
                </div>
                <h4>
                  {nextAppointment.doctorName ? `Dr. ${nextAppointment.doctorName}` : 'Specialist Consultation'}
                </h4>
                <div className="next-appt-specs">
                  <span className="next-appt-spec-item">
                    <Calendar size={14} color="var(--primary)" />
                    {formatDateIndian(nextAppointment.date)}
                  </span>
                  <span className="next-appt-spec-item">
                    <Clock size={14} color="var(--primary)" />
                    {formatTimeIndian(nextAppointment.startTime, false)} - {formatTimeIndian(nextAppointment.endTime, false)} IST
                  </span>
                  <span className="next-appt-spec-item">
                    <MapPin size={14} color="var(--text-muted)" />
                    Main Clinic • Room 302
                  </span>
                </div>
              </div>
            </div>

            <div className="next-appt-actions">
              <Link to={`/patient/appointments/${nextAppointment.id}`}>
                <Button variant="outline" size="sm" leftIcon={<FileText size={14} />}>
                  View Details
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle size={14} />}
                onClick={() => setCancelModalAppointmentId(nextAppointment.id)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Card
            className="next-appointment-hero-card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="next-appt-avatar" style={{ backgroundColor: 'var(--surface-alt)', color: 'var(--text-muted)' }}>
                <Calendar size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600 }}>No upcoming appointments scheduled</h4>
                <p className="helper-text">Ready to consult with a specialist? Book a visit in seconds.</p>
              </div>
            </div>
            <Link to="/patient/doctors">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle size={14} />}>
                Browse Doctors
              </Button>
            </Link>
          </Card>
        )}

        {/* Medication Reminders Section */}
        <div id="prescriptions" style={{ marginBottom: '1.75rem' }}>
          <MedicationReminderList />
        </div>

        {/* Account Information Card */}
        <Card
          id="profile"
          title="Patient Account & Security Details"
          icon={<User size={18} />}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Patient ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {user?._id}
              </div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Registered Full Name</div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Email Address</div>
              <div style={{ fontWeight: 500 }}>{user?.email}</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Security Session</div>
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                Bearer Token Active (JWT)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={!!cancelModalAppointmentId}
        title="Cancel Appointment Confirmation"
        message="Are you sure you want to cancel this scheduled consultation? The held time slot will be released back to the hospital schedule."
        confirmLabel="Yes, Cancel Appointment"
        cancelLabel="Keep Appointment"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalAppointmentId(null)}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
