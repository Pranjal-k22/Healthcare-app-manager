import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminDoctorResetRequests,
  approveAdminDoctorResetRequest,
  denyAdminDoctorResetRequest,
} from '../../services/authApi';
import { DoctorResetRequestItem } from '../../types/auth';
import {
  KeyRound,
  ShieldAlert,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const DoctorResetRequests: React.FC = () => {
  const [requests, setRequests] = useState<DoctorResetRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'DENIED' | 'ALL'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    requestId: string;
    doctorName: string;
    action: 'APPROVE' | 'DENY';
  }>({
    isOpen: false,
    requestId: '',
    doctorName: '',
    action: 'APPROVE',
  });

  const { success, error: toastError } = useToast();

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchAdminDoctorResetRequests(statusFilter);
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctor reset requests queue.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleActionClick = (requestId: string, doctorName: string, action: 'APPROVE' | 'DENY') => {
    setConfirmModal({
      isOpen: true,
      requestId,
      doctorName,
      action,
    });
  };

  const executeAction = async () => {
    const { requestId, action } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    setActionLoadingId(requestId);

    try {
      if (action === 'APPROVE') {
        const res = await approveAdminDoctorResetRequest(requestId);
        success(res.message || 'Doctor reset request approved!', 'Approval Complete');
      } else {
        const res = await denyAdminDoctorResetRequest(requestId);
        success(res.message || 'Doctor reset request denied.', 'Request Denied');
      }
      await loadRequests();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to process request.';
      toastError(errMsg, 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <KeyRound size={28} color="var(--primary)" />
            Doctor Password Reset Requests
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review and approve clinical physician password reset applications before 6-digit OTP delivery.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRequests} leftIcon={<RefreshCw size={16} />}>
          Refresh Queue
        </Button>
      </div>

      {error && <InlineAlert type="danger" message={error} onClose={() => setError(null)} />}

      {/* Filter Tabs */}
      <div className="role-tabs-container" style={{ marginBottom: '1.5rem', maxWidth: '450px' }}>
        <button
          type="button"
          className={`role-tab-btn ${statusFilter === 'PENDING' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending Review
        </button>
        <button
          type="button"
          className={`role-tab-btn ${statusFilter === 'APPROVED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('APPROVED')}
        >
          Approved
        </button>
        <button
          type="button"
          className={`role-tab-btn ${statusFilter === 'DENIED' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('DENIED')}
        >
          Denied
        </button>
        <button
          type="button"
          className={`role-tab-btn ${statusFilter === 'ALL' ? 'is-active' : ''}`}
          onClick={() => setStatusFilter('ALL')}
        >
          All
        </button>
      </div>

      {/* Table Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        {isLoading ? (
          <SkeletonTable rows={4} columns={5} />
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <ShieldAlert size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>No Doctor Reset Requests Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              There are currently no doctor requests matching the selected status filter.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Physician</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Requested At</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Review Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Stethoscope size={15} color="var(--primary)" />
                      Dr. {item.doctor?.name || 'Unknown Doctor'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{item.doctor?.email || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>
                      DOCTOR
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {new Date(item.requestedAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      backgroundColor: item.status === 'APPROVED' ? '#ECFDF5' : item.status === 'DENIED' ? '#FEF2F2' : item.status === 'PENDING' ? '#FFFBEB' : '#F1F5F9',
                      color: item.status === 'APPROVED' ? '#059669' : item.status === 'DENIED' ? '#DC2626' : item.status === 'PENDING' ? '#D97706' : '#64748B',
                      padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.reviewedBy ? (
                      <div>Reviewed by {item.reviewedBy.name}</div>
                    ) : (
                      <div>Awaiting Admin Review</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {item.status === 'PENDING' ? (
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionLoadingId === item._id}
                          onClick={() => handleActionClick(item._id, item.doctor?.name || 'Doctor', 'APPROVE')}
                          leftIcon={<Check size={14} />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={actionLoadingId === item._id}
                          onClick={() => handleActionClick(item._id, item.doctor?.name || 'Doctor', 'DENY')}
                          leftIcon={<X size={14} />}
                          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          Deny
                        </Button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: confirmModal.action === 'APPROVE' ? '#059669' : '#dc2626' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                {confirmModal.action === 'APPROVE' ? 'Approve Doctor Reset?' : 'Deny Doctor Reset?'}
              </h3>
            </div>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {confirmModal.action === 'APPROVE'
                ? `Approving this request will generate a 6-digit numeric OTP and email it directly to Dr. ${confirmModal.doctorName}. The OTP expires in 10 minutes.`
                : `Denying this request will send a neutral notice to Dr. ${confirmModal.doctorName}.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={executeAction}
                style={{ backgroundColor: confirmModal.action === 'APPROVE' ? 'var(--primary)' : '#dc2626' }}
              >
                {confirmModal.action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Denial'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorResetRequests;
