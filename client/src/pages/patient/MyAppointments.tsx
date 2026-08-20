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
import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  PlusCircle,
  Search,
} from 'lucide-react';
import { CalendarSettingsCard } from '../../components/calendar/CalendarSettingsCard';

export const MyAppointments: React.FC = () => {
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
      setActionSuccess('Appointment cancelled successfully.');
      fetchAppointments();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel appointment.');
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
      setActionSuccess('Appointment rescheduled successfully.');
      fetchAppointments();
    } catch (err: any) {
      setRescheduleError(
        err.response?.data?.message || err.message || 'Failed to reschedule appointment.'
      );
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
            My Appointments
          </h1>
          <p className="welcome-subtitle">
            Manage your booked consultations, view clinical history, or reschedule appointments.
          </p>
        </div>
        <Link to="/patient/doctors" className="btn btn-primary">
          <Search size={16} />
          <span>Book New Consultation</span>
        </Link>
      </div>

      {/* Google Calendar Synchronization (Phase 6) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <CalendarSettingsCard />
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'ALL' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('ALL');
            setActionSuccess(null);
          }}
        >
          All Appointments
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'BOOKED' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('BOOKED');
            setActionSuccess(null);
          }}
        >
          Upcoming
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'COMPLETED' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('COMPLETED');
            setActionSuccess(null);
          }}
        >
          Completed
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'CANCELLED' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('CANCELLED');
            setActionSuccess(null);
          }}
        >
          Cancelled
        </button>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            Loading your appointments...
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card empty-state-card" style={{ marginTop: '1rem' }}>
          <CalendarCheck2 size={48} color="var(--text-muted)" />
          <h3 style={{ marginTop: '1rem' }}>No Appointments Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.25rem' }}>
            {activeTab === 'ALL'
              ? 'You have no scheduled appointments on record.'
              : `You have no ${activeTab.toLowerCase()} appointments.`}
          </p>
          <Link to="/patient/doctors" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Find a Doctor & Book</span>
          </Link>
        </div>
      ) : (
        <div className="appointments-grid" style={{ marginTop: '1.25rem' }}>
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
  );
};
