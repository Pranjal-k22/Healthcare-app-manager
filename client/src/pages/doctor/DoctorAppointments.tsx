import React, { useState, useEffect } from 'react';
import {
  cancelAppointment,
  completeAppointment,
  getDoctorAppointments,
} from '../../services/appointmentApi';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { AppointmentCard } from '../../components/appointment/AppointmentCard';
import { CancelAppointmentModal } from '../../components/appointment/CancelAppointmentModal';
import { SkeletonCard } from '../../components/ui/Skeleton';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
  Clock,
  ListFilter,
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
    <div className="container dashboard-container" style={{ maxWidth: '1080px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Consultation Schedule
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Stethoscope size={12} /> Doctor Queue
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
              View upcoming patient visits, launch AI consultation rooms, and issue prescriptions.
            </p>
          </div>
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

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab('TODAY');
            setActionSuccess(null);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'TODAY' ? 700 : 500,
            background: activeTab === 'TODAY' ? '#0062cc' : '#f8fafc',
            color: activeTab === 'TODAY' ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CalendarDays size={14} />
          <span>Today ({todayStr})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('BOOKED');
            setActionSuccess(null);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'BOOKED' ? 700 : 500,
            background: activeTab === 'BOOKED' ? '#0062cc' : '#f8fafc',
            color: activeTab === 'BOOKED' ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={14} />
          <span>Upcoming Booked</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('COMPLETED');
            setActionSuccess(null);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'COMPLETED' ? 700 : 500,
            background: activeTab === 'COMPLETED' ? '#0062cc' : '#f8fafc',
            color: activeTab === 'COMPLETED' ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CheckCircle2 size={14} />
          <span>Completed Visits</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setActionSuccess(null);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: activeTab === 'ALL' ? 700 : 500,
            background: activeTab === 'ALL' ? '#0062cc' : '#f8fafc',
            color: activeTab === 'ALL' ? '#ffffff' : '#64748b',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ListFilter size={14} />
          <span>All Consultations</span>
        </button>
      </div>

      {/* Appointment Cards List */}
      {isLoading ? (
        <div className="skeleton-grid">
          <SkeletonCard />
          <SkeletonCard />
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
            There are no appointments matching the selected view filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              appointment={app}
              viewRole="DOCTOR"
              onCancel={(a) => setSelectedAppForCancel(a)}
              onComplete={handleCompleteAppointment}
              isActionLoading={isCompleting}
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

export default DoctorAppointments;
