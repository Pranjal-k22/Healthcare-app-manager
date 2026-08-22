import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addDoctorLeave,
  getDoctorById,
  getDoctorLeaves,
  removeDoctorLeave,
} from '../../services/doctorApi';
import {
  getAllDoctorLeavesAdmin,
  updateDoctorLeaveStatusAdmin,
} from '../../services/leaveApi';
import { Doctor, Leave } from '../../types/doctor';
import { DoctorLeaveItem } from '../../types/leave';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarOff,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';

export const ManageDoctorLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [formalLeaves, setFormalLeaves] = useState<DoctorLeaveItem[]>([]);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(null);

  const fetchDoctorAndLeaves = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [docData, leavesData, formalData] = await Promise.all([
        getDoctorById(id),
        getDoctorLeaves(id),
        getAllDoctorLeavesAdmin().catch(() => [] as DoctorLeaveItem[]),
      ]);
      setDoctor(docData);
      setLeaves(leavesData);
      // Filter formal leaves belonging to this doctor (by doctorId._id or doctorId string or email match)
      const docLeaves = formalData.filter((fl) => {
        if (typeof fl.doctorId === 'object' && fl.doctorId !== null) {
          return fl.doctorId._id === id || fl.doctorId.email === docData.email;
        }
        return fl.doctorId === id;
      });
      setFormalLeaves(docLeaves);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor leave data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAndLeaves();
  }, [id]);

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !leaveDate) return;

    setError(null);
    setSuccessMessage(null);

    if (leaves.some((l) => l.date === leaveDate)) {
      setError(`Leave is already scheduled on ${leaveDate}.`);
      return;
    }

    try {
      setIsAdding(true);
      const res = await addDoctorLeave(id, {
        date: leaveDate,
        reason: leaveReason.trim() || 'Unavailable',
      });
      setLeaves(res.data);
      if (res.cancelledAppointmentsCount && res.cancelledAppointmentsCount > 0) {
        setSuccessMessage(
          `Leave scheduled on ${leaveDate}. Notice: ${res.cancelledAppointmentsCount} existing appointment(s) were cancelled and affected patients have been notified.`
        );
      } else {
        setSuccessMessage(`Scheduled leave on ${leaveDate} successfully.`);
      }
      setLeaveDate('');
      setLeaveReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule leave.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveLeave = async (dateToRemove: string) => {
    if (!id) return;
    setError(null);
    setSuccessMessage(null);

    try {
      setDeletingDate(dateToRemove);
      const updatedLeaves = await removeDoctorLeave(id, dateToRemove);
      setLeaves(updatedLeaves);
      setSuccessMessage(`Removed leave for ${dateToRemove}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove leave.');
    } finally {
      setDeletingDate(null);
    }
  };

  const handleUpdateFormalLeaveStatus = async (
    leaveId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    let adminNotes = '';
    if (status === 'REJECTED') {
      const input = window.prompt('Please enter a reason or remarks for declining this leave:');
      if (input === null) return; // User cancelled prompt
      adminNotes = input.trim();
    } else {
      const confirmApproval = window.confirm(
        'Approve this leave request? An email confirmation will be sent to the doctor and consultation slots will be blocked.'
      );
      if (!confirmApproval) return;
    }

    try {
      setProcessingLeaveId(leaveId);
      setError(null);
      setSuccessMessage(null);

      const result = await updateDoctorLeaveStatusAdmin(leaveId, {
        status,
        adminNotes,
      });

      setFormalLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? result.leave : l))
      );

      setSuccessMessage(
        status === 'APPROVED'
          ? '✅ Leave approved successfully! Confirmation email has been dispatched to Dr. ' + (doctor?.name || '') + '.'
          : '❌ Leave request declined. A notification email with your remarks has been sent to the doctor.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update leave status.');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', borderWidth: '3px' }} />
        <p style={{ color: '#64748b', marginTop: '1rem', fontWeight: 500 }}>
          Loading leave schedule...
        </p>
      </div>
    );
  }

  const pendingFormalLeaves = formalLeaves.filter((l) => l.status === 'PENDING');
  const pastOrReviewedLeaves = formalLeaves.filter((l) => l.status !== 'PENDING');

  return (
    <div className="container dashboard-container" style={{ maxWidth: '920px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/admin/doctors"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#0062cc',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Manage Practitioner Leaves & Absence
          </h1>
          {doctor && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                background: '#eff6ff',
                color: '#0062cc',
                border: '1px solid #bfdbfe',
              }}
            >
              {doctor.specialization}
            </span>
          )}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
          Review doctor leave applications, approve off-duty periods with automated email dispatches, or directly schedule unavailable dates for <strong>Dr. {doctor?.name}</strong>.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pending Leave Requests Section (Admin Review) */}
      {pendingFormalLeaves.length > 0 && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: '#fffbeb',
            borderRadius: '14px',
            border: '1.5px solid #fde68a',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Clock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                  Pending Leave Applications ({pendingFormalLeaves.length})
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#b45309' }}>
                  Submitted by doctor. Approval sends automated confirmation email and blocks booking slots.
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '999px', background: '#f59e0b', color: '#ffffff' }}>
              Action Required
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingFormalLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.15rem 1.25rem',
                  background: '#ffffff',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                      {leave.startDate === leave.endDate
                        ? leave.startDate
                        : `${leave.startDate} → ${leave.endDate}`}
                    </strong>
                    <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>
                      PENDING REVIEW
                    </span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#475569' }}>
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    disabled={processingLeaveId === leave.id}
                    onClick={() => handleUpdateFormalLeaveStatus(leave.id, 'APPROVED')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: processingLeaveId === leave.id ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Approve & Notify Doctor</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingLeaveId === leave.id}
                    onClick={() => handleUpdateFormalLeaveStatus(leave.id, 'REJECTED')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #fca5a5',
                      background: '#ffffff',
                      color: '#dc2626',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: processingLeaveId === leave.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <XCircle size={15} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Direct Leave Date Card (Admin Direct Override) */}
      <div
        style={{
          marginBottom: '1.75rem',
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
            <CalendarOff size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Directly Schedule Unavailable / Leave Date
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Admin override: immediately blocks patient booking slots for Dr. {doctor?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleAddLeave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Leave Date *
              </label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Medical Conference, Hospital Duty, Annual Leave"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isAdding || !leaveDate}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isAdding || !leaveDate ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Plus size={16} />
                <span>{isAdding ? 'Scheduling...' : 'Add Leave Date'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Formal Leave History & Decision Logs */}
      {pastOrReviewedLeaves.length > 0 && (
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1.5rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <ShieldCheck size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Formal Leave Applications History ({pastOrReviewedLeaves.length})
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pastOrReviewedLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {leave.startDate === leave.endDate
                        ? leave.startDate
                        : `${leave.startDate} → ${leave.endDate}`}
                    </span>
                    <span
                      style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: leave.status === 'APPROVED' ? '#ecfdf5' : leave.status === 'REJECTED' ? '#fef2f2' : '#f1f5f9',
                        color: leave.status === 'APPROVED' ? '#059669' : leave.status === 'REJECTED' ? '#dc2626' : '#64748b',
                        border: `1px solid ${leave.status === 'APPROVED' ? '#a7f3d0' : leave.status === 'REJECTED' ? '#fecaca' : '#cbd5e1'}`,
                      }}
                    >
                      {leave.status}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Reason: <strong>{leave.reason}</strong>
                    {leave.rejectionReason && (
                      <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                        • Admin Remarks: "{leave.rejectionReason}"
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Leaves List Card */}
      <div
        style={{
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
              <Calendar size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Scheduled Leave Days on Calendar ({leaves.length})
            </h3>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
            }}
          >
            <Calendar size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
              No active leave days scheduled for Dr. {doctor?.name}. All standard working days are active.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {leaves.map((leave, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                    }}
                  >
                    {leave.date}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    {leave.reason || 'Unavailable'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveLeave(leave.date)}
                  disabled={deletingDate === leave.date}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: deletingDate === leave.date ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  <span>{deletingDate === leave.date ? 'Removing...' : 'Remove'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctorLeave;
