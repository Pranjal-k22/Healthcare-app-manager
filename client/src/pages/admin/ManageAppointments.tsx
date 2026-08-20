import React, { useState, useEffect } from 'react';
import {
  cancelAppointment,
  getAllAppointmentsForAdmin,
} from '../../services/appointmentApi';
import { getDoctors } from '../../services/doctorApi';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { Doctor } from '../../types/doctor';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { CancelAppointmentModal } from '../../components/appointment/CancelAppointmentModal';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const ManageAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [selectedAppForCancel, setSelectedAppForCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.warn('Failed to load doctor list for filter', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllAppointmentsForAdmin({
        doctorId: selectedDoctorId || undefined,
        status: (selectedStatus as AppointmentStatus) || undefined,
        date: selectedDate || undefined,
      });
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinic appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctorId, selectedStatus, selectedDate]);

  const handleConfirmCancel = async () => {
    if (!selectedAppForCancel) return;
    try {
      setIsCancelling(true);
      setCancelError(null);
      await cancelAppointment(selectedAppForCancel.id);
      setSelectedAppForCancel(null);
      setActionSuccess('Appointment cancelled administratively.');
      fetchAppointments();
    } catch (err: any) {
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  const bookedCount = appointments.filter((a) => a.status === 'BOOKED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
              Clinic Appointments
            </h1>
            <span className="role-badge badge-admin">
              <ShieldCheck size={12} /> Admin Directory
            </span>
          </div>
          <p className="welcome-subtitle">
            System-wide overview of patient consultations, capacity utilization, and visit records.
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{appointments.length}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Active Booked</span>
          <span className="stat-value" style={{ color: 'var(--primary)' }}>
            {bookedCount}
          </span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Completed</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {completedCount}
          </span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Cancelled</span>
          <span className="stat-value" style={{ color: '#fb7185' }}>
            {cancelledCount}
          </span>
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

      {/* Filters Bar */}
      <div className="glass-card search-bar-container" style={{ marginBottom: '1.5rem' }}>
        <div className="search-inputs-row">
          <div className="form-group search-field" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <select
              className="form-input"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="">All Practitioners</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group search-field" style={{ width: '180px', marginBottom: 0 }}>
            <select
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="form-group search-field" style={{ width: '180px', marginBottom: 0 }}>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {(selectedDoctorId || selectedStatus || selectedDate) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedDoctorId('');
                setSelectedStatus('');
                setSelectedDate('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loader-container">
          <div className="spinner" style={{ width: '32px', height: '32px' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            Loading clinic appointments...
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card empty-state-card">
          <Calendar size={48} color="var(--text-muted)" />
          <h3 style={{ marginTop: '1rem' }}>No Appointments Found</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
            No clinic appointments match the selected filters.
          </p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              viewRole="ADMIN"
              onCancel={(a) => {
                setSelectedAppForCancel(a);
                setCancelError(null);
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
    </div>
  );
};
