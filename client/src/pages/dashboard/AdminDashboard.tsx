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
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Edit,
  CalendarDays,
  CheckCircle2,
  Server,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Status toggle confirmation modal
  const [toggleTarget, setToggleTarget] = useState<{ id: string; name: string; newStatus: boolean } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    try {
      const [docsData, apptsData] = await Promise.all([
        getDoctors({ includeInactive: true }),
        getAllAppointmentsForAdmin().catch(() => []),
      ]);
      setDoctors(docsData);
      setAppointments(apptsData);
    } catch (err: any) {
      console.warn('Could not load admin stats', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const bookedAppointments = appointments.filter((a) => a.status === 'BOOKED');

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

  // Doctor Table Columns: Name, Specialization, Email, Slot Duration, Status, Actions (NO passwords ever rendered)
  const doctorColumns: Column<Doctor>[] = [
    {
      key: 'name',
      header: 'Doctor Name',
      sortable: true,
      render: (doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(0, 98, 204, 0.08)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {doc.name.replace(/^Dr\.\s*/i, '').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name}</div>
            <div className="helper-text">{doc.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (doc) => <span className="table-text">{doc.email}</span>,
    },
    {
      key: 'slotDuration',
      header: 'Slot Duration',
      align: 'center',
      render: (doc) => (
        <span className="table-text" style={{ fontWeight: 500 }}>
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
      <div className="admin-dashboard-view">
        {/* Welcome Header */}
        <div className="dashboard-header-row">
          <div>
            <h1 className="welcome-title">
              Welcome, {user?.name}
              <span className="role-badge badge-admin">
                <ShieldCheck size={12} /> Administrator
              </span>
            </h1>
            <p className="welcome-subtitle">
              Hospital operations terminal, practitioner directory, and system security controls.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <SummaryStatCard
            label="Total Patients"
            value="148"
            icon={<Users size={20} />}
            iconBgColor="rgba(0, 98, 204, 0.08)"
            iconColor="var(--primary)"
            subtext="+12 this week"
          />
          <SummaryStatCard
            label="Total Doctors"
            value={doctors.length || '—'}
            icon={<Stethoscope size={20} />}
            iconBgColor="var(--success-bg)"
            iconColor="var(--success)"
            subtext="Configured staff"
          />
          <SummaryStatCard
            label="Today's Appointments"
            value={todayAppointments.length}
            icon={<Calendar size={20} />}
            iconBgColor="rgba(57, 49, 175, 0.08)"
            iconColor="var(--primary-dark)"
            subtext="Real-time schedule"
          />
          <SummaryStatCard
            label="Booked Requests"
            value={bookedAppointments.length}
            icon={<Clock size={20} />}
            iconBgColor="var(--warning-bg)"
            iconColor="var(--warning)"
            subtext="Active slots"
          />
          <SummaryStatCard
            label="Monthly Revenue"
            value="$24,500"
            icon={<DollarSign size={20} />}
            iconBgColor="var(--info-bg)"
            iconColor="var(--info)"
            subtext="Hospital billing"
          />
          <SummaryStatCard
            label="Unread Feedback"
            value="2"
            icon={<MessageSquare size={20} />}
            iconBgColor="rgba(220, 53, 69, 0.08)"
            iconColor="var(--danger)"
            subtext="Quality assurance"
          />
        </div>

        {/* Primary Doctor Management DataTable */}
        <div style={{ marginBottom: '1.75rem' }}>
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
            mobileCardRender={(doc) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{doc.name}</span>
                  <StatusBadge
                    status={doc.isActive ? 'ACTIVE' : 'EXPIRED'}
                    label={doc.isActive ? 'Active' : 'Inactive'}
                    size="sm"
                  />
                </div>
                <div className="helper-text">{doc.specialization} • {doc.email}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                  <Link to={`/admin/doctors/${doc.id}/edit`} style={{ flex: 1 }}>
                    <Button variant="outline" size="sm" fullWidth>
                      Edit Profile
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
              </div>
            )}
          />
        </div>

        {/* Security & System Info */}
        <Card title="System Security & Provisioning Controls" icon={<Server size={18} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Administrator ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{user?._id}</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Administrative Role</div>
              <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Superuser Full Provisioning</div>
            </div>
            <div>
              <div className="helper-text" style={{ marginBottom: '4px' }}>Compliance Status</div>
              <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} />
                HIPAA & SOC-2 Audited
              </div>
            </div>
          </div>
        </Card>
      </div>

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
