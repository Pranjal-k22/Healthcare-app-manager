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
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  Stethoscope,
  FileCheck,
  FileText,
  PlayCircle,
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
  
  // Calculate unique patients
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

  // Appointment Table Columns: Patient name, Time, Contact, Reason for visit, Status, Actions
  const columns: Column<Appointment>[] = [
    {
      key: 'patientName',
      header: 'Patient Name',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 98, 204, 0.08)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            {(item.patientName || 'P').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.patientName || 'Patient'}
            </div>
            <div className="helper-text">{item.date}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time Window',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <Clock size={14} color="var(--primary)" />
          <span>{item.startTime} - {item.endTime}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (item) => (
        <span className="table-text" style={{ color: 'var(--text-secondary)' }}>
          {item.patientEmail || 'Verified Patient'}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason for Visit',
      render: (item) => (
        <span className="table-text" style={{ maxWidth: '200px', display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {item.symptoms || item.reason || 'Routine Health Consultation'}
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
          {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
            <Link to={`/doctor/consultation/${item.id}`}>
              <Button variant="primary" size="sm" leftIcon={<PlayCircle size={13} />}>
                Start
              </Button>
            </Link>
          )}
          <Link to={`/doctor/consultation/${item.id}`}>
            <Button variant="outline" size="sm" leftIcon={<FileText size={13} />}>
              Prescribe
            </Button>
          </Link>
          {item.status !== 'CANCELLED' && item.status !== 'COMPLETED' && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: 'var(--danger)' }}
              onClick={() => setCancelModalAppointmentId(item.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="doctor-dashboard-view">
        {/* Welcome Header */}
        <div className="dashboard-header-row">
          <div>
            <h1 className="welcome-title">
              Welcome, Dr. {user?.name}
              <span className="role-badge badge-doctor">
                <Stethoscope size={12} /> Doctor
              </span>
            </h1>
            <p className="welcome-subtitle">
              Clinical consultation terminal, schedule overview, and e-prescription manager.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/doctor/profile">
              <Button variant="outline" size="md" leftIcon={<Clock size={16} />}>
                Set Weekly Hours
              </Button>
            </Link>
            <Link to="/doctor/appointments">
              <Button variant="primary" size="md" leftIcon={<Calendar size={16} />}>
                All Consultations
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Summary Stat Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <SummaryStatCard
            label="Today's Appointments"
            value={todayAppointments.length}
            icon={<Calendar size={20} />}
            iconBgColor="rgba(0, 98, 204, 0.08)"
            iconColor="var(--primary)"
            subtext="Consultation schedule"
          />
          <SummaryStatCard
            label="Booked Consultations"
            value={bookedAppointments.length}
            icon={<Clock size={20} />}
            iconBgColor="var(--warning-bg)"
            iconColor="var(--warning)"
            subtext="Awaiting intake"
          />
          <SummaryStatCard
            label="Completed Consultations"
            value={completedAppointments.length}
            icon={<CheckCircle2 size={20} />}
            iconBgColor="var(--success-bg)"
            iconColor="var(--success)"
            subtext="EHR records updated"
          />
          <SummaryStatCard
            label="Total Patients"
            value={uniquePatients || '12'}
            icon={<Users size={20} />}
            iconBgColor="rgba(57, 49, 175, 0.08)"
            iconColor="var(--primary-dark)"
            subtext="Registered individuals"
          />
          <SummaryStatCard
            label="Unread Messages"
            value="0"
            icon={<MessageSquare size={20} />}
            iconBgColor="var(--info-bg)"
            iconColor="var(--info)"
            subtext="Patient inquiries"
          />
        </div>

        {/* Primary Appointments DataTable */}
        <div style={{ marginBottom: '1.75rem' }}>
          <DataTable
            title="Scheduled Patient Appointments"
            columns={columns}
            data={appointments}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search by patient name, reason, time..."
            exportFileName="doctor-appointments"
            filterOptions={{
              label: 'Status',
              key: 'status',
              options: [
                { label: 'Booked', value: 'BOOKED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
              ],
            }}
            mobileCardRender={(item) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{item.patientName || 'Patient'}</span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="helper-text" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="var(--primary)" />
                  <span>{item.date} • {item.startTime} - {item.endTime}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Reason: {item.symptoms || item.reason || 'General Consultation'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                  <Link to={`/doctor/consultation/${item.id}`} style={{ flex: 1 }}>
                    <Button variant="primary" size="sm" fullWidth>
                      Start Consultation
                    </Button>
                  </Link>
                  {item.status !== 'CANCELLED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelModalAppointmentId(item.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          />
        </div>

        {/* Doctor Clinical Profile & Privileges */}
        <Card title="Practitioner Information & Status" icon={<FileCheck size={18} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Practitioner ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{user?._id}</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Practitioner Name</div>
              <div style={{ fontWeight: 600 }}>Dr. {user?.name}</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Clinical Account Status</div>
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                Verified Doctor (RBAC Active)
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={!!cancelModalAppointmentId}
        title="Cancel Patient Consultation"
        message="Are you sure you want to cancel this scheduled appointment? The patient will be notified automatically."
        confirmLabel="Yes, Cancel Appointment"
        cancelLabel="Keep Scheduled"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalAppointmentId(null)}
      />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
