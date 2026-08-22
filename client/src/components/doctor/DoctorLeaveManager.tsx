import React, { useState, useEffect } from 'react';
import {
  getMyDoctorLeaves,
  createDoctorLeave,
  cancelDoctorLeave,
  checkLeaveConflicts,
} from '../../services/leaveApi';
import { DoctorLeaveItem, ConflictingAppointment } from '../../types/leave';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  PlusCircle,
  Trash2,
  XCircle,
  CalendarOff,
} from 'lucide-react';
import './DoctorLeaveManager.css';

export const DoctorLeaveManager: React.FC = () => {
  const [leaves, setLeaves] = useState<DoctorLeaveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Conflict Pre-Check State
  const [conflicts, setConflicts] = useState<ConflictingAppointment[]>([]);
  const [conflictChecked, setConflictChecked] = useState(false);

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await getMyDoctorLeaves();
      setLeaves(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load leave records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Run conflict check whenever dates change
  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      const runPreCheck = async () => {
        try {
          const result = await checkLeaveConflicts(startDate, endDate);
          setConflicts(result.conflictingAppointments || []);
          setConflictChecked(true);
        } catch (err) {
          // Non-blocking
        }
      };

      runPreCheck();
    } else {
      setConflicts([]);
      setConflictChecked(false);
    }
  }, [startDate, endDate]);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    if (startDate > endDate) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const created = await createDoctorLeave({
        startDate,
        endDate,
        reason: reason.trim(),
      });

      setLeaves((prev) => [created, ...prev]);
      setStartDate('');
      setEndDate('');
      setReason('');
      setConflicts([]);
      setConflictChecked(false);
      setSuccessMsg('Leave application submitted for Admin review. An alert email was sent to Hospital Administration. You will receive an email confirmation once reviewed.');
    } catch (err: any) {
      if (err.response?.data?.conflictingAppointments) {
        setConflicts(err.response.data.conflictingAppointments);
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg(
          err.response?.data?.message ||
            err.message ||
            'Failed to register leave.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave? Slots in this period will become available for patient bookings.')) {
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const updated = await cancelDoctorLeave(leaveId);
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? updated : l))
      );
      setSuccessMsg('Leave cancelled. Your consultation availability has been restored.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel leave.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="leave-status-pill leave-status-approved">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="leave-status-pill leave-status-pending">
            <Clock size={12} /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="leave-status-pill leave-status-rejected">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="leave-status-pill leave-status-cancelled">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="leave-manager-container">
      {successMsg && (
        <div style={{ padding: '0.85rem 1.15rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#065f46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <CheckCircle2 size={17} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.85rem 1.15rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={17} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leave Application Form */}
      <form onSubmit={handleCreateLeave} className="leave-form-card">
        <h4 className="leave-card-title">
          <div className="leave-card-title-icon">
            <Calendar size={18} />
          </div>
          <span>Schedule New Leave / Off-Duty Period</span>
        </h4>

        <div className="leave-form-grid">
          {/* Start Date */}
          <div className="leave-input-group">
            <label className="leave-input-label" htmlFor="leaveStart">
              Start Date
            </label>
            <div className="leave-input-wrapper">
              <Calendar size={16} />
              <input
                id="leaveStart"
                type="date"
                className="leave-input-control"
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div className="leave-input-group">
            <label className="leave-input-label" htmlFor="leaveEnd">
              End Date
            </label>
            <div className="leave-input-wrapper">
              <Calendar size={16} />
              <input
                id="leaveEnd"
                type="date"
                className="leave-input-control"
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Reason / Notes */}
          <div className="leave-input-group leave-field-full">
            <label className="leave-input-label" htmlFor="leaveReason">
              Reason / Notes
            </label>
            <div className="leave-input-wrapper">
              <FileText size={16} />
              <input
                id="leaveReason"
                type="text"
                className="leave-input-control"
                placeholder="e.g., Annual Leave, Medical Conference, Family Emergency"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Conflict Detection Card */}
        {conflictChecked && conflicts.length > 0 && (
          <div className="leave-conflict-box">
            <div className="leave-conflict-header">
              <AlertTriangle size={18} />
              <span>Conflict Warning: {conflicts.length} appointment(s) already booked</span>
            </div>
            <p className="leave-conflict-text">
              To safeguard scheduled patients, leave cannot be approved while active appointments exist. Please reschedule or manage the following bookings first:
            </p>
            <div className="leave-conflict-list">
              {conflicts.map((c) => (
                <div key={c.id} className="leave-conflict-item">
                  <span className="leave-conflict-time">
                    {c.date} • {c.startTime} - {c.endTime}
                  </span>
                  <span className="leave-conflict-patient">Patient: {c.patientName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="leave-submit-bar">
          <button
            type="submit"
            className="leave-submit-btn"
            disabled={isSubmitting || (conflictChecked && conflicts.length > 0)}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                <span>Registering Leave...</span>
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Confirm Leave Period</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Leave Records List */}
      <div className="leave-list-card">
        <div className="leave-list-header">
          <h4 className="leave-list-title">Registered Leave Records</h4>
          <span className="leave-count-pill">{leaves.length} {leaves.length === 1 ? 'Record' : 'Records'}</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto', width: '32px', height: '32px', borderWidth: '3px' }} />
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.75rem' }}>Loading leave schedule...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="leave-empty-state">
            <div className="leave-empty-icon">
              <CalendarOff size={24} />
            </div>
            <h5 className="leave-empty-title">No Leave Registered</h5>
            <p className="leave-empty-desc">
              You are currently active and available for all scheduled working slots. Use the form above to record planned off-duty periods.
            </p>
          </div>
        ) : (
          <div className="leave-records-stack">
            {leaves.map((leave) => (
              <div key={leave.id} className="leave-record-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <span className="leave-date-range">
                      {leave.startDate === leave.endDate
                        ? leave.startDate
                        : `${leave.startDate} → ${leave.endDate}`}
                    </span>
                    {getStatusBadge(leave.status)}
                  </div>
                  <p className="leave-reason-text">
                    Reason: <strong>{leave.reason}</strong>
                  </p>
                </div>

                {leave.status === 'APPROVED' && (
                  <button
                    type="button"
                    className="leave-cancel-btn"
                    onClick={() => handleCancelLeave(leave.id)}
                    title="Cancel this leave and reopen booking slots"
                  >
                    <Trash2 size={14} />
                    <span>Cancel Leave</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
