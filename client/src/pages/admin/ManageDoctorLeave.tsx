import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  addDoctorLeave,
  getDoctorById,
  getDoctorLeaves,
  removeDoctorLeave,
} from '../../services/doctorApi';
import { Doctor, Leave } from '../../types/doctor';
import { LeaveList } from '../../components/doctor/LeaveList';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarOff,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const ManageDoctorLeave: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const fetchDoctorAndLeaves = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [docData, leavesData] = await Promise.all([
        getDoctorById(id),
        getDoctorLeaves(id),
      ]);
      setDoctor(docData);
      setLeaves(leavesData);
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

    // Duplicate check in frontend
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

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading leave schedule...
        </p>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <h1 className="welcome-title" style={{ fontSize: '1.75rem' }}>
            Manage Doctor Leaves
          </h1>
          {doctor && (
            <span className="specialization-badge">{doctor.specialization}</span>
          )}
        </div>
        <p className="welcome-subtitle">
          Configure unavailable days and vacation leaves for {doctor?.name}.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Leave Form */}
      <div className="glass-card form-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarOff size={18} color="#f59e0b" />
          <span>Schedule New Leave Date</span>
        </h3>

        <form onSubmit={handleAddLeave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="leaveDateInput">
              Leave Date (YYYY-MM-DD) *
            </label>
            <input
              id="leaveDateInput"
              type="date"
              className="form-input"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="leaveReasonInput">
              Reason / Notes (Optional)
            </label>
            <input
              id="leaveReasonInput"
              type="text"
              className="form-input"
              placeholder="e.g. Medical Conference, Personal"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isAdding || !leaveDate}
            style={{ height: '42px' }}
          >
            {isAdding ? (
              <>
                <div className="spinner" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Schedule Leave</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Leaves List */}
      <div className="glass-card info-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--primary)" />
            <span>Scheduled Leaves ({leaves.length})</span>
          </div>
        </h3>

        <LeaveList
          leaves={leaves}
          onDelete={handleRemoveLeave}
          isDeleting={deletingDate}
        />
      </div>
    </div>
  );
};
