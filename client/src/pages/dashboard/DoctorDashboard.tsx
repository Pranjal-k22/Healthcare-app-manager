import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorAppointments, cancelAppointment } from '../../services/appointmentApi';
import { Appointment } from '../../types/appointment';
import DashboardLayout from '../../components/ui/DashboardLayout';
import SummaryStatCard from '../../components/ui/SummaryStatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable, { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
  FileText,
  PlayCircle,
  CalendarDays,
  Activity,
} from 'lucide-react';


export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.warn('Failed to load doctor appointments', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const bookedAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const uniquePatients = new Set(appointments.map((a) => a.patientId || a.patientName)).size;

  const handleConfirmCancel = async () => {
    if (!cancelModalAppointmentId) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(cancelModalAppointmentId);
      success('Appointment cancelled.', 'Cancelled');
      setCancelModalAppointmentId(null);
      await fetchAppointments();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel appointment', 'Action Failed');
    } finally {
      setIsCancelling(false);
    }
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'patientName',
      header: 'Patient Name',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 98, 204, 0.12), rgba(0, 198, 255, 0.12))',
              color: '#0062cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            {(item.patientName || 'P').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
              {item.patientName || 'Patient'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.date}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time Window',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#1e293b', fontSize: '0.88rem' }}>
          <Clock size={14} color="#0062cc" />
          <span>{item.startTime} – {item.endTime}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Patient Email',
      render: (item) => (
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
          {item.patientEmail || 'Verified Patient'}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reported Symptoms / Reason',
      render: (item) => (
        <span style={{ maxWidth: '220px', display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}>
          {item.symptoms || item.reason || 'General Consultation'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      searchable: false,
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Link to={`/doctor/consultation/${item.id}`}>
            <Button
              variant={item.status === 'COMPLETED' ? 'outline' : 'primary'}
              size="sm"
              leftIcon={item.status === 'COMPLETED' ? <FileText size={13} /> : <PlayCircle size={13} />}
            >
              {item.status === 'COMPLETED' ? 'View Notes' : 'Open Room'}
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Welcome Header */}
        <div
          style={{
            padding: '1.75rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Welcome, Dr. {user?.name?.replace(/^Dr\.\s*/i, '')}
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Stethoscope size={13} /> Physician Portal
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.4rem', marginBottom: 0 }}>
              Live consultation queue, AI intake symptom synthesis, and electronic prescription desk.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/doctor/appointments">
              <Button variant="primary" size="md" leftIcon={<Calendar size={16} />}>
                Consultation Queue
              </Button>
            </Link>
            <Link to="/doctor/profile">
              <Button variant="outline" size="md" leftIcon={<CalendarDays size={16} />}>
                Schedule & Hours
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <SummaryStatCard
            label="Today's Patients"
            value={todayAppointments.length}
            icon={<Calendar size={20} />}
            iconBgColor="#eff6ff"
            iconColor="#0062cc"
            subtext="Scheduled visits"
          />
          <SummaryStatCard
            label="Active Queue"
            value={bookedAppointments.length}
            icon={<Clock size={20} />}
            iconBgColor="#fffbeb"
            iconColor="#d97706"
            subtext="Awaiting consultation"
          />
          <SummaryStatCard
            label="Completed Visits"
            value={completedAppointments.length}
            icon={<CheckCircle2 size={20} />}
            iconBgColor="#ecfdf5"
            iconColor="#059669"
            subtext="Records documented"
          />
          <SummaryStatCard
            label="Total Patients"
            value={uniquePatients}
            icon={<Users size={20} />}
            iconBgColor="#f5f3ff"
            iconColor="#9333ea"
            subtext="Unique patients treated"
          />
          <SummaryStatCard
            label="All Appointments"
            value={appointments.length}
            icon={<Activity size={20} />}
            iconBgColor="#f0f9ff"
            iconColor="#0284c7"
            subtext="Total clinical volume"
          />
        </div>

        {/* Doctor Consultation Queue Table */}
        <div>
          <DataTable
            title="Scheduled Patient Consultations"
            columns={columns}
            data={appointments}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search patient name, date, symptoms..."
            exportFileName="doctor-consultations-roster"
            actions={
              <Link to="/doctor/appointments">
                <Button variant="outline" size="sm" leftIcon={<Calendar size={14} />}>
                  View Full Schedule
                </Button>
              </Link>
            }
            filterOptions={{
              label: 'Status',
              key: 'status',
              options: [
                { label: 'Booked / Pending', value: 'BOOKED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ],
            }}
          />
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(cancelModalAppointmentId)}
        title="Cancel Patient Appointment"
        message="Are you sure you want to cancel this consultation? The patient will receive an automated email notice."
        confirmLabel="Cancel Appointment"
        cancelLabel="Keep Appointment"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalAppointmentId(null)}
      />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
