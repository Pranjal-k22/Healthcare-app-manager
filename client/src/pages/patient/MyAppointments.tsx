import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from '../../services/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { CancelAppointmentModal } from '../../components/appointment/CancelAppointmentModal';
import { RescheduleModal } from '../../components/appointment/RescheduleModal';
import { CalendarSettingsCard } from '../../components/calendar/CalendarSettingsCard';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InlineAlert from '../../components/ui/InlineAlert';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import {
  Search,
  Plus,
} from 'lucide-react';

export const MyAppointments: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | AppointmentStatus>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [selectedAppForCancel, setSelectedAppForCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [selectedAppForReschedule, setSelectedAppForReschedule] = useState<Appointment | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyAppointments(
        activeTab === 'ALL' ? undefined : activeTab
      );
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleConfirmCancel = async () => {
    if (!selectedAppForCancel) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      await cancelAppointment(selectedAppForCancel.id);
      setSelectedAppForCancel(null);
      const msg = 'Appointment cancelled successfully.';
      setActionSuccess(msg);
      success(msg, 'Cancelled');
      fetchAppointments();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to cancel appointment.';
      setCancelError(errMsg);
      toastError(errMsg, 'Action Error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async (newDate: string, newStartTime: string) => {
    if (!selectedAppForReschedule) return;
    try {
      setIsRescheduling(true);
      setRescheduleError(null);
      await rescheduleAppointment(selectedAppForReschedule.id, {
        date: newDate,
        startTime: newStartTime,
      });
      setSelectedAppForReschedule(null);
      const msg = 'Appointment rescheduled successfully.';
      setActionSuccess(msg);
      success(msg, 'Rescheduled');
      fetchAppointments();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to reschedule appointment.';
      setRescheduleError(errMsg);
      toastError(errMsg, 'Action Error');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="my-appointments-view">
        {/* Page Header Row */}
        <div className="dashboard-header-row" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">My Appointments</h1>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Manage your booked consultations, view clinical history, or reschedule appointments.
            </p>
          </div>
          <Link to="/patient/doctors">
            <Button variant="primary" size="md" leftIcon={<Search size={16} />}>
              Book New Consultation
            </Button>
          </Link>
        </div>

        {/* Google Calendar Synchronization Card */}
        <div style={{ marginBottom: '2rem' }}>
          <CalendarSettingsCard />
        </div>

        {/* Success / Error Alerts */}
        {actionSuccess && (
          <InlineAlert
            type="success"
            message={actionSuccess}
            onClose={() => setActionSuccess(null)}
            className="mb-4"
          />
        )}

        {error && (
          <InlineAlert
            type="danger"
            message={error}
            onClose={() => setError(null)}
            className="mb-4"
          />
        )}

        {/* Segmented Filter Tab Group */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="segmented-tab-group" role="tablist">
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === 'ALL' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('ALL');
                setActionSuccess(null);
              }}
              role="tab"
              aria-selected={activeTab === 'ALL'}
            >
              All Appointments
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === 'BOOKED' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('BOOKED');
                setActionSuccess(null);
              }}
              role="tab"
              aria-selected={activeTab === 'BOOKED'}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === 'COMPLETED' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('COMPLETED');
                setActionSuccess(null);
              }}
              role="tab"
              aria-selected={activeTab === 'COMPLETED'}
            >
              Completed
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${activeTab === 'CANCELLED' ? 'is-active' : ''}`}
              onClick={() => {
                setActiveTab('CANCELLED');
                setActionSuccess(null);
              }}
              role="tab"
              aria-selected={activeTab === 'CANCELLED'}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Content Area: Loader, Empty State, or Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="btn-spinner" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              Loading your appointments...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <EmptyState
              imageSrc="/undraw_online-calendar_iz1q.svg"
              title="No Appointments Found"
              description={
                activeTab === 'ALL'
                  ? 'You have no scheduled appointments on record. Connect with a specialist to book your next consultation.'
                  : `You currently have no ${activeTab.toLowerCase()} appointments in your record.`
              }
              action={
                <Link to="/patient/doctors">
                  <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
                    Find a Doctor & Book
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="appointments-grid-ui">
            {appointments.map((app) => (
              <AppointmentCard
                key={app.id}
                appointment={app}
                viewRole="PATIENT"
                onCancel={(a) => {
                  setSelectedAppForCancel(a);
                  setCancelError(null);
                }}
                onReschedule={(a) => {
                  setSelectedAppForReschedule(a);
                  setRescheduleError(null);
                }}
              />
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        <CancelAppointmentModal
          appointment={selectedAppForCancel}
          isOpen={Boolean(selectedAppForCancel)}
          onClose={() => setSelectedAppForCancel(null)}
          onConfirm={handleConfirmCancel}
          isProcessing={isCancelling}
          error={cancelError}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          appointment={selectedAppForReschedule}
          isOpen={Boolean(selectedAppForReschedule)}
          onClose={() => setSelectedAppForReschedule(null)}
          onConfirm={handleConfirmReschedule}
          isProcessing={isRescheduling}
          error={rescheduleError}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyAppointments;
