import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllDoctorLeavesAdmin,
  updateDoctorLeaveStatusAdmin,
  cancelDoctorLeave,
} from '../../services/leaveApi';
import { getDoctors } from '../../services/doctorApi';
import { DoctorLeaveItem, LeaveStatus } from '../../types/leave';
import { SkeletonTable } from '../../components/ui/Skeleton';
import {
  AlertCircle,
  Calendar,
  CalendarOff,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const AllDoctorLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<DoctorLeaveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingLeaveId, setProcessingLeaveId] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Specialization Map (userId -> specialization)
  const [specMap, setSpecMap] = useState<Record<string, string>>({});
  // Doctor ID Map (userId -> doctorProfileId)
  const [docProfileIdMap, setDocProfileIdMap] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [leavesData, doctorsData] = await Promise.all([
        getAllDoctorLeavesAdmin(),
        getDoctors({ includeInactive: true }),
      ]);

      setLeaves(leavesData);

      // Construct maps
      const specs: Record<string, string> = {};
      const profileIds: Record<string, string> = {};
      doctorsData.forEach((doc) => {
        if (doc.userId) {
          specs[doc.userId] = doc.specialization;
          profileIds[doc.userId] = doc.id;
        }
      });
      setSpecMap(specs);
      setDocProfileIdMap(profileIds);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaves data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    let adminNotes = '';
    const leaveItem = leaves.find((l) => l.id === leaveId);
    const doctorName =
      leaveItem && typeof leaveItem.doctorId === 'object'
        ? leaveItem.doctorId.name
        : 'Doctor';

    if (status === 'REJECTED') {
      const input = window.prompt(
        `Please enter a reason/remarks for declining the leave request from Dr. ${doctorName}:`
      );
      if (input === null) return;
      adminNotes = input.trim();
    } else {
      const confirmApproval = window.confirm(
        `Approve the leave request from Dr. ${doctorName}? This will automatically cancel any conflicting patient appointments and block their booking slots.`
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

      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? result.leave : l))
      );

      setSuccessMessage(
        status === 'APPROVED'
          ? `✅ Leave approved successfully for Dr. ${doctorName}! Conflicting appointments have been cancelled and patient notifications dispatched.`
          : `❌ Leave request declined for Dr. ${doctorName}.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update leave status.');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    const leaveItem = leaves.find((l) => l.id === leaveId);
    const doctorName =
      leaveItem && typeof leaveItem.doctorId === 'object'
        ? leaveItem.doctorId.name
        : 'Doctor';

    const confirmed = window.confirm(
      `Are you sure you want to cancel the approved leave for Dr. ${doctorName}? Their standard slots in this period will become available for booking again.`
    );
    if (!confirmed) return;

    try {
      setProcessingLeaveId(leaveId);
      setError(null);
      setSuccessMessage(null);

      const updated = await cancelDoctorLeave(leaveId);
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? updated : l))
      );

      setSuccessMessage(`Leave cancelled successfully for Dr. ${doctorName}. Consultation availability restored.`);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel leave.');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  // Helper to extract doctor fields cleanly
  const getDoctorDetails = (doctorId: string | { _id: string; name: string; email: string }) => {
    if (typeof doctorId === 'object' && doctorId !== null) {
      return {
        id: doctorId._id,
        name: doctorId.name,
        email: doctorId.email,
        specialization: specMap[doctorId._id] || 'General Practitioner',
        profileId: docProfileIdMap[doctorId._id] || '',
      };
    }
    return {
      id: doctorId,
      name: 'Unknown Practitioner',
      email: '',
      specialization: specMap[doctorId] || 'General Practitioner',
      profileId: docProfileIdMap[doctorId] || '',
    };
  };

  // Filter & Search Logic
  const filteredLeaves = leaves.filter((leave) => {
    const doc = getDoctorDetails(leave.doctorId);
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate count metrics
  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ maxWidth: '1180px', padding: '2rem 1.5rem', margin: '0 auto' }}>
        <SkeletonTable rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '1180px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Practitioner Leaves & Absences
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
            <ShieldCheck size={12} /> Leave Registry
          </span>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
          Central command for reviewing leave requests, approving off-duty applications, or cancelling scheduled absences.
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

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calendar size={14} /> Total Requests
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{leaves.length}</div>
        </div>

        <div style={{ padding: '1.25rem', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Clock size={14} /> Pending Review
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '0.5rem' }}>{pendingCount}</div>
        </div>

        <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <CheckCircle2 size={14} /> Approved
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>{approvedCount}</div>
        </div>

        <div style={{ padding: '1.25rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <XCircle size={14} /> Rejected
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', marginTop: '0.5rem' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.15rem 1.25rem',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === status ? '#0062cc' : '#f1f5f9',
                color: statusFilter === status ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search practitioner or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.9rem 0.55rem 2.3rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Main List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredLeaves.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              borderRadius: '14px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
            }}
          >
            <CalendarOff size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
              No Leave Requests Found
            </h3>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              No leave logs match your current search queries or filter selections.
            </p>
          </div>
        ) : (
          filteredLeaves.map((leave) => {
            const doc = getDoctorDetails(leave.doctorId);
            return (
              <div
                key={leave.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                {/* Information Column */}
                <div style={{ flex: '1 1 350px' }}>
                  {/* Doctor Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      Dr. {doc.name}
                    </h3>
                    <span
                      style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {doc.specialization}
                    </span>
                    {doc.profileId && (
                      <Link
                        to={`/admin/doctors/${doc.profileId}/leave`}
                        style={{
                          fontSize: '0.75rem',
                          color: '#0062cc',
                          textDecoration: 'none',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.15rem',
                        }}
                      >
                        Schedule Overrides <ArrowRight size={10} />
                      </Link>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                    {doc.email}
                  </span>

                  {/* Dates Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0062cc', background: '#eff6ff', padding: '0.2rem 0.65rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
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
                        background:
                          leave.status === 'APPROVED'
                            ? '#ecfdf5'
                            : leave.status === 'PENDING'
                            ? '#fffbeb'
                            : leave.status === 'REJECTED'
                            ? '#fef2f2'
                            : '#f1f5f9',
                        color:
                          leave.status === 'APPROVED'
                            ? '#059669'
                            : leave.status === 'PENDING'
                            ? '#d97706'
                            : leave.status === 'REJECTED'
                            ? '#dc2626'
                            : '#64748b',
                        border: `1px solid ${
                          leave.status === 'APPROVED'
                            ? '#a7f3d0'
                            : leave.status === 'PENDING'
                            ? '#fde68a'
                            : leave.status === 'REJECTED'
                            ? '#fecaca'
                            : '#cbd5e1'
                        }`,
                      }}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <p style={{ margin: '0.55rem 0 0', fontSize: '0.86rem', color: '#334155' }}>
                    Reason: <strong>{leave.reason}</strong>
                    {leave.rejectionReason && (
                      <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                        • Decline Remarks: "{leave.rejectionReason}"
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions Column */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {leave.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={processingLeaveId === leave.id}
                        onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
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
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingLeaveId === leave.id}
                        onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
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
                    </>
                  )}

                  {leave.status === 'APPROVED' && (
                    <button
                      type="button"
                      disabled={processingLeaveId === leave.id}
                      onClick={() => handleCancelLeave(leave.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: processingLeaveId === leave.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Cancel Leave</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AllDoctorLeaves;
