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
  Filter,
  RefreshCw,
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
    <div className="container dashboard-container" style={{ maxWidth: '1180px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Clinic Appointments Directory
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  background: '#eff6ff',
                  color: '#0062cc',
                  border: '1px solid #bfdbfe',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <ShieldCheck size={12} /> Admin Directory
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
              System-wide overview of patient consultations, capacity utilization, and visit records.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAppointments}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Bookings
          </span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {appointments.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>All-time registered visits</span>
        </div>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0062cc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Booked
          </span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0062cc', lineHeight: 1 }}>
            {bookedCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Upcoming consultations</span>
        </div>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completed Visits
          </span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>
            {completedCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Finished & documented</span>
        </div>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cancelled
          </span>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
            {cancelledCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Cancelled or rescheduled</span>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div
        style={{
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={16} color="#0062cc" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter Appointments
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Practitioner
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                background: '#ffffff',
              }}
            >
              <option value="">All Practitioners</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                background: '#ffffff',
              }}
            >
              <option value="">All Statuses</option>
              <option value="BOOKED">Booked (Upcoming)</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
              Consultation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                background: '#ffffff',
              }}
            />
          </div>

          {(selectedDoctorId || selectedStatus || selectedDate) && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorId('');
                  setSelectedStatus('');
                  setSelectedDate('');
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto', borderWidth: '3px' }} />
          <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 500 }}>
            Loading clinic appointments...
          </p>
        </div>
      ) : appointments.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <Calendar size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
            No appointments found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            No appointments match your selected filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              viewRole="ADMIN"
              onCancel={(a) => setSelectedAppForCancel(a)}
            />
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {selectedAppForCancel && (
        <CancelAppointmentModal
          appointment={selectedAppForCancel}
          isOpen={Boolean(selectedAppForCancel)}
          onClose={() => setSelectedAppForCancel(null)}
          onConfirm={handleConfirmCancel}
          isProcessing={isCancelling}
          error={cancelError}
        />
      )}
    </div>
  );
};

