import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMyAppointments, cancelAppointment } from '../../services/appointmentApi';
import { getMyPrescriptions } from '../../services/clinicalApi';
import { getInvoices } from '../../services/billingApi';
import { Appointment } from '../../types/appointment';
import DashboardLayout from '../../components/ui/DashboardLayout';
import SummaryStatCard from '../../components/ui/SummaryStatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/Toast';
import { MedicationReminderList } from '../../components/patient/MedicationReminderList';
import { formatDateIndian, formatTimeIndian } from '../../utils/dateUtils';
import {
  CalendarCheck,
  CheckCircle2,
  Pill,
  CreditCard,
  Search,
  Calendar,
  Clock,
  FileText,
  Plus,
  ArrowRight,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptionsCount, setPrescriptionsCount] = useState<number>(0);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);

  const [cancelModalAppointmentId, setCancelModalAppointmentId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const appData = await getMyAppointments();
      setAppointments(appData);

      try {
        const rxData = await getMyPrescriptions();
        setPrescriptionsCount(rxData.length);
      } catch {
        setPrescriptionsCount(0);
      }

      try {
        const billData = await getInvoices({ status: 'pending' });
        const unpaidTotal = billData.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        setOutstandingBalance(unpaidTotal);
      } catch {
        setOutstandingBalance(0);
      }
    } catch (err: any) {
      console.warn('Failed to load patient appointments', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingAppointments = appointments.filter((a) => a.status === 'BOOKED');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const handleConfirmCancel = async () => {
    if (!cancelModalAppointmentId) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(cancelModalAppointmentId);
      success('Appointment was cancelled successfully.', 'Cancelled');
      setCancelModalAppointmentId(null);
      await fetchDashboardData();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel appointment', 'Action Failed');
    } finally {
      setIsCancelling(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="patient-dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 1. DASHBOARD WELCOME HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="welcome-title" style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Patient'}
            </h1>
            <p className="welcome-subtitle" style={{ fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
              Your healthcare at a glance.
            </p>
          </div>

          <Link to="/patient/doctors">
            <Button variant="primary" size="md" leftIcon={<Plus size={16} />}>
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* 2. PRIMARY TOP GRID: NEXT APPOINTMENT (Left 62%) & QUICK ACTIONS (Right 38%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
          {/* Left: Primary Next Appointment Card */}
          <div style={{ flex: '1 1 60%' }}>
            {nextAppointment ? (
              <div className="next-appointment-hero-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
                      Next Appointment
                    </span>
                    <StatusBadge status={nextAppointment.status} size="sm" />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
                    <Avatar
                      name={nextAppointment.doctorName}
                      seed={typeof nextAppointment.doctorId === 'object' ? (nextAppointment.doctorId as any)?._id : nextAppointment.doctorId}
                      size="xl"
                    />
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {nextAppointment.doctorName ? `Dr. ${nextAppointment.doctorName}` : 'Specialist Doctor'}
                      </h3>
                      <span style={{ fontSize: '0.88rem', color: 'var(--info-text, #0D9488)', fontWeight: 600 }}>
                        Cardiology / General Care
                      </span>
                    </div>
                  </div>

                  <div className="next-appt-timing-box" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <Calendar size={16} color="var(--primary)" />
                      <span>{formatDateIndian(nextAppointment.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <Clock size={16} color="var(--primary)" />
                      <span>{formatTimeIndian(nextAppointment.startTime, false)} - {formatTimeIndian(nextAppointment.endTime, false)} IST</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/patient/appointments/${nextAppointment.id}`} style={{ flex: 1 }}>
                    <Button variant="primary" size="sm" fullWidth leftIcon={<FileText size={15} />}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <EmptyState
                  imageSrc="/undraw_online-calendar_iz1q.svg"
                  title="No upcoming appointments"
                  description="Need to see a doctor? Find a specialist and book a convenient appointment."
                  action={
                    <Link to="/patient/doctors">
                      <Button variant="primary" size="sm" leftIcon={<Search size={15} />}>
                        Find a Doctor
                      </Button>
                    </Link>
                  }
                />
              </Card>
            )}
          </div>

          {/* Right: Quick Actions Panel */}
          <div style={{ flex: '1 1 40%' }}>
            <Card title="Quick Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <Link
                  to="/patient/doctors"
                  className="quick-action-link-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="quick-action-icon-wrap" style={{ color: 'var(--primary)' }}>
                      <Search size={18} />
                    </div>
                    <div>
                      <div className="quick-action-title">Find a Doctor</div>
                      <div className="quick-action-desc">Search verified medical specialists</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="quick-action-arrow" />
                </Link>

                <Link
                  to="/patient/appointments"
                  className="quick-action-link-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="quick-action-icon-wrap" style={{ color: 'var(--primary)' }}>
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <div className="quick-action-title">My Appointments</div>
                      <div className="quick-action-desc">Review upcoming and past visits</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="quick-action-arrow" />
                </Link>

                <Link
                  to="/patient/prescriptions"
                  className="quick-action-link-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="quick-action-icon-wrap" style={{ color: '#0D9488' }}>
                      <Pill size={18} />
                    </div>
                    <div>
                      <div className="quick-action-title">Prescriptions</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Access active digital medications</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </Link>

                <Link
                  to="/patient/billing"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    textDecoration: 'none',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#F5F3FF', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>Billing & Invoices</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>View statements & payments</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94A3B8" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* 3. SUMMARY METRICS (4 Cards Row) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <SummaryStatCard
            label="Upcoming Appointments"
            value={upcomingAppointments.length}
            icon={<CalendarCheck size={20} />}
            iconBgColor="#EFF6FF"
            iconColor="#2563EB"
            subtext="Confirmed & Active"
          />
          <SummaryStatCard
            label="Completed Visits"
            value={completedAppointments.length}
            icon={<CheckCircle2 size={20} />}
            iconBgColor="#DCFCE7"
            iconColor="#16A34A"
            subtext="Care history on file"
          />
          <SummaryStatCard
            label="Active Prescriptions"
            value={prescriptionsCount}
            icon={<Pill size={20} />}
            iconBgColor="#CCFBF1"
            iconColor="#0D9488"
            subtext="Medication records"
          />
          <SummaryStatCard
            label="Outstanding Balance"
            value={`₹${outstandingBalance.toLocaleString('en-IN')}`}
            icon={<CreditCard size={20} />}
            iconBgColor="#F3E8FF"
            iconColor="#6D28D9"
            subtext={outstandingBalance > 0 ? 'Payment pending' : 'All accounts settled'}
          />
        </div>

        {/* 4. MEDICATION SCHEDULE */}
        <div id="prescriptions">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Today's Medication
            </h3>
            <Link to="/patient/prescriptions" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <MedicationReminderList />
        </div>

        {/* 5. UPCOMING APPOINTMENTS LIST */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarCheck size={18} color="#2563EB" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Upcoming Appointments
              </h3>
            </div>
            <Link to="/patient/appointments" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}>
              View all appointments →
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              imageSrc="/undraw_online-calendar_iz1q.svg"
              title="No upcoming visits scheduled"
              description="Browse top specialists and pick a suitable time slot for your next consultation."
              action={
                <Link to="/patient/doctors">
                  <Button variant="outline" size="sm" leftIcon={<Search size={14} />}>
                    Browse Doctors
                  </Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingAppointments.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Avatar
                      name={app.doctorName}
                      seed={typeof app.doctorId === 'object' ? (app.doctorId as any)?._id : app.doctorId}
                      size="md"
                    />
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Dr. {app.doctorName}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                        <span>{formatDateIndian(app.date)}</span>
                        <span>•</span>
                        <span>{formatTimeIndian(app.startTime, false)} IST</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={app.status} size="sm" />
                    <Link to={`/patient/appointments/${app.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={!!cancelModalAppointmentId}
        title="Cancel Appointment Confirmation"
        message="Are you sure you want to cancel this scheduled consultation? The held time slot will be released back to the hospital schedule."
        confirmLabel="Yes, Cancel Appointment"
        cancelLabel="Keep Appointment"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalAppointmentId(null)}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
