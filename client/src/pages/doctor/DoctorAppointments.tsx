import React, { useState, useEffect } from 'react';
import {
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
} from '../../services/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { CancelAppointmentModal } from '../../components/appointment/CancelAppointmentModal';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'ALL' | 'BOOKED' | 'COMPLETED'>('TODAY');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals / Action states
  const [selectedAppForCancel, setSelectedAppForCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let statusParam: AppointmentStatus | undefined = undefined;
      let dateParam: string | undefined = undefined;

      if (activeTab === 'TODAY') {
        dateParam = todayStr;
      } else if (activeTab === 'BOOKED' || activeTab === 'COMPLETED') {
        statusParam = activeTab;
      }

      const data = await getDoctorAppointments(statusParam, dateParam);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor consultation schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleCompleteAppointment = async (app: Appointment) => {
    try {
      setIsCompleting(true);
      setError(null);
      await completeAppointment(app.id);
      setActionSuccess(`Consultation with ${app.patientName} marked as completed.`);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to complete appointment.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppForCancel) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      await cancelAppointment(selectedAppForCancel.id);
      setSelectedAppForCancel(null);
      setActionSuccess('Appointment cancelled.');
      fetchAppointments();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
              Patient Consultations
            </h1>
            <span className="role-badge badge-doctor">
              <Stethoscope size={12} /> Doctor Terminal
            </span>
          </div>
          <p className="welcome-subtitle">
            View patient appointment queues, conduct scheduled visits, and manage consultation statuses.
          </p>
        </div>
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
          className={`tab-btn ${activeTab === 'TODAY' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('TODAY');
            setActionSuccess(null);
          }}
        >
          <CalendarDays size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
          Today ({todayStr})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'BOOKED' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('BOOKED');
            setActionSuccess(null);
          }}
        >
          Upcoming Booked
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
          className={`tab-btn ${activeTab === 'ALL' ? 'tab-btn-active' : ''}`}
          onClick={() => {
            setActiveTab('ALL');
            setActionSuccess(null);
          }}
        >
          All History
        </button>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            Loading consultation schedule...
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card empty-state-card" style={{ marginTop: '1rem' }}>
          <Calendar size={48} color="var(--text-muted)" />
          <h3 style={{ marginTop: '1rem' }}>No Consultations Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
            {activeTab === 'TODAY'
              ? 'You have no consultations scheduled for today.'
              : 'No appointments match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="appointments-grid" style={{ marginTop: '1.25rem' }}>
          {appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              viewRole="DOCTOR"
              onComplete={handleCompleteAppointment}
              onCancel={(a) => {
                setSelectedAppForCancel(a);
                setCancelError(null);
              }}
              isActionLoading={isCompleting}
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
    </div>
  );
};
