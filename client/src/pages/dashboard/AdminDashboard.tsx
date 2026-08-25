import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDoctors, toggleDoctorActiveStatus } from '../../services/doctorApi';
import { getAllAppointmentsForAdmin } from '../../services/appointmentApi';
import { Doctor } from '../../types/doctor';
import { Appointment } from '../../types/appointment';
import DashboardLayout from '../../components/ui/DashboardLayout';
import SummaryStatCard from '../../components/ui/SummaryStatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable, { Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import {
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  Edit,
  CalendarDays,
  CheckCircle2,
  Server,
  Activity,
} from 'lucide-react';


export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Status toggle confirmation modal
  const [toggleTarget, setToggleTarget] = useState<{ id: string; name: string; newStatus: boolean } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [docsData, apptsData] = await Promise.all([
        getDoctors({ includeInactive: true }),
        getAllAppointmentsForAdmin().catch(() => []),
      ]);
      setDoctors(docsData);
      setAppointments(apptsData);
    } catch (err: any) {
      console.warn('Could not load admin stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const bookedAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    try {
      setIsUpdatingStatus(true);
      await toggleDoctorActiveStatus(toggleTarget.id, toggleTarget.newStatus);
      success(
        `Dr. ${toggleTarget.name} has been ${toggleTarget.newStatus ? 'activated' : 'deactivated'}.`,
        'Status Updated'
      );
      setToggleTarget(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update practitioner status', 'Action Error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const doctorColumns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor Name',
      sortable: true,
      render: (doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 98, 204, 0.12), rgba(0, 198, 255, 0.12))',
              color: '#0062cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            {doc.name.replace(/^Dr\.\s*/i, '').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{doc.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (doc) => <span style={{ fontSize: '0.88rem', color: '#475569' }}>{doc.email}</span>,
    },
    {
      key: 'slotDuration',
      header: 'Slot Duration',
      align: 'center',
      render: (doc) => (
        <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', background: '#eff6ff', color: '#0062cc' }}>
          {doc.slotDuration} mins
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      align: 'center',
      render: (doc) => (
        <StatusBadge
          status={doc.isActive ? 'ACTIVE' : 'EXPIRED'}
          label={doc.isActive ? 'Active' : 'Inactive'}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      searchable: false,
      align: 'right',
      render: (doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Link to={`/admin/doctors/${doc.id}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Edit size={13} />}>
              Edit
            </Button>
          </Link>
          <Link to={`/admin/doctors/${doc.id}/leave`}>
            <Button variant="outline" size="sm" leftIcon={<CalendarDays size={13} />}>
              Leave
            </Button>
          </Link>
          <Button
            variant={doc.isActive ? 'danger' : 'success'}
            size="sm"
            onClick={() =>
              setToggleTarget({
                id: doc.id,
                name: doc.name,
                newStatus: !doc.isActive,
              })
            }
          >
            {doc.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingScreen message="Loading administration dashboard..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Welcome Header */}
        <div className="doctor-clinical-hero-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 className="welcome-title" style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Welcome, {user?.name}
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(167, 139, 250, 0.15)',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  color: '#C4B5FD',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={13} /> Super Administrator
              </span>
            </div>
            <p className="welcome-subtitle" style={{ fontSize: '0.92rem', marginTop: '0.4rem', marginBottom: 0 }}>
              Hospital operations terminal, practitioner directory, slot capacity, and compliance controls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/doctors/create">
              <Button variant="primary" size="md" leftIcon={<PlusCircle size={16} />}>
                Provision Doctor
              </Button>
            </Link>
            <Link to="/admin/appointments">
              <Button variant="outline" size="md" leftIcon={<Calendar size={16} />}>
                All Appointments
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Top Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <SummaryStatCard
            label="Total Doctors"
            value={doctors.length || '0'}
            icon={<Stethoscope size={20} />}
            iconBgColor="#eff6ff"
            iconColor="#0062cc"
            subtext="Configured staff"
          />
          <SummaryStatCard
            label="Active Bookings"
            value={bookedAppointments.length}
            icon={<Clock size={20} />}
            iconBgColor="#fffbeb"
            iconColor="#d97706"
            subtext="Upcoming slots"
          />
          <SummaryStatCard
            label="Today's Schedule"
            value={todayAppointments.length}
            icon={<Calendar size={20} />}
            iconBgColor="#f5f3ff"
            iconColor="#3931af"
            subtext="Live appointments"
          />
          <SummaryStatCard
            label="Completed Visits"
            value={completedAppointments.length}
            icon={<CheckCircle2 size={20} />}
            iconBgColor="#ecfdf5"
            iconColor="#059669"
            subtext="Documented records"
          />
          <SummaryStatCard
            label="Total Appointments"
            value={appointments.length}
            icon={<Activity size={20} />}
            iconBgColor="#f0f9ff"
            iconColor="#0284c7"
            subtext="All-time volume"
          />
          <SummaryStatCard
            label="Est. Revenue"
            value={`$${appointments.reduce((sum, a) => sum + ((a as any).fee || 75), 0)}`}
            icon={<DollarSign size={20} />}
            iconBgColor="#ecfdf5"
            iconColor="#10b981"
            subtext="Clinic bookings"
          />
        </div>

        {/* Primary Doctor Management DataTable */}
        <div>
          <DataTable
            title="Hospital Practitioner Directory"
            columns={doctorColumns}
            data={doctors}
            keyExtractor={(doc) => doc.id}
            searchPlaceholder="Search by doctor name, specialization, email..."
            exportFileName="hospital-doctors-roster"
            actions={
              <Link to="/admin/doctors/create">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle size={14} />}>
                  Add Doctor
                </Button>
              </Link>
            }
            filterOptions={{
              label: 'Status',
              key: 'isActive',
              options: [
                { label: 'Active Staff', value: 'TRUE' },
                { label: 'Inactive / On Leave', value: 'FALSE' },
              ],
            }}
          />
        </div>

        {/* Security & System Info */}
        <Card title="System Security & Provisioning Controls" icon={<Server size={18} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Administrator ID
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {user?._id}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Administrative Role
              </div>
              <div style={{ fontWeight: 700, color: '#3931af' }}>Superuser Full Provisioning</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Compliance Status
              </div>
              <div style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} />
                Encrypted OAuth & AES-256-GCM
              </div>
            </div>
          </div>
        </Card>
      </div>
      )}

      {/* Confirmation Dialog for Doctor Status Toggle */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        title={`${toggleTarget?.newStatus ? 'Activate' : 'Deactivate'} Practitioner`}
        message={
          toggleTarget?.newStatus
            ? `Are you sure you want to activate Dr. ${toggleTarget.name}? Patients will be able to view their profile and book slots.`
            : `Are you sure you want to deactivate Dr. ${toggleTarget?.name}? Existing appointments remain, but new booking will be halted.`
        }
        confirmLabel={toggleTarget?.newStatus ? 'Activate Practitioner' : 'Deactivate Practitioner'}
        cancelLabel="Cancel"
        variant={toggleTarget?.newStatus ? 'primary' : 'danger'}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
