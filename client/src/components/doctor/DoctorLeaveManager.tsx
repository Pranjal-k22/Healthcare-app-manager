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
  PlusCircle,
  Trash2,
  XCircle,
} from 'lucide-react';

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
      setSuccessMsg('Leave registered successfully. Consultation slots for this period are now blocked.');
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
    if (!window.confirm('Are you sure you want to cancel this leave? Slots in this period will become available for bookings.')) {
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const updated = await cancelDoctorLeave(leaveId);
      setLeaves((prev) =>
        prev.map((l) => (l.id === leaveId ? updated : l))
      );
      setSuccessMsg('Leave cancelled. Your calendar slots have been restored.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel leave.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="doctor-leave-manager">
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Leave Application Form */}
      <form onSubmit={handleCreateLeave} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="var(--primary)" />
          <span>Schedule New Leave / Off-Duty Period</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="leaveStart">
              Start Date
            </label>
            <input
              id="leaveStart"
              type="date"
              className="form-input"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="leaveEnd">
              End Date
            </label>
            <input
              id="leaveEnd"
              type="date"
              className="form-input"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="leaveReason">
              Reason / Notes
            </label>
            <input
              id="leaveReason"
              type="text"
              className="form-input"
              placeholder="e.g., Annual Leave, Medical Conference, Personal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Conflict Detection Card */}
        {conflictChecked && conflicts.length > 0 && (
          <div className="alert alert-warning" style={{ margin: '1rem 0', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <span>Conflict Warning: {conflicts.length} appointment(s) already booked during this period</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              To protect patient appointments, leave cannot be approved while active bookings exist. Please reschedule or cancel the following consultations before applying:
            </p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              {conflicts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <strong>{c.date} ({c.startTime} - {c.endTime})</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Patient: {c.patientName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting || (conflictChecked && conflicts.length > 0)}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Registering Leave...</span>
              </>
            ) : (
              <>
                <PlusCircle size={15} />
                <span>Confirm Leave Period</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Leave Records List */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          Registered Leave Records
        </h4>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto', width: '28px', height: '28px' }} />
          </div>
        ) : leaves.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>
            No leave records registered. You are currently available on all scheduled working days.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {leaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.85rem 1.25rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {leave.startDate === leave.endDate
                        ? leave.startDate
                        : `${leave.startDate} to ${leave.endDate}`}
                    </strong>
                    {getStatusBadge(leave.status)}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Reason: {leave.reason}
                  </p>
                </div>

                {leave.status === 'APPROVED' && (
                  <button
                    type="button"
                    className="btn btn-danger-outline btn-sm"
                    style={{ padding: '0.35rem 0.65rem' }}
                    onClick={() => handleCancelLeave(leave.id)}
                    title="Cancel this leave"
                  >
                    <Trash2 size={14} />
                    <span>Cancel</span>
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
