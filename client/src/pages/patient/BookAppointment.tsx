import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../../services/doctorApi';
import { bookAppointment, getAvailableSlots } from '../../services/appointmentApi';
import { Doctor } from '../../types/doctor';
import { Appointment, AvailableSlot } from '../../types/appointment';
import { SlotPicker } from '../../components/appointment/SlotPicker';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load Doctor Details
  useEffect(() => {
    const fetchDoc = async () => {
      if (!doctorId) return;
      try {
        setIsLoadingDoctor(true);
        setError(null);
        const data = await getDoctorById(doctorId);
        setDoctor(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load doctor profile.');
      } finally {
        setIsLoadingDoctor(false);
      }
    };

    fetchDoc();
  }, [doctorId]);

  // Fetch dynamic slots when date or doctorId changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !selectedDate) return;
      try {
        setIsLoadingSlots(true);
        setError(null);
        setSelectedSlot(null);
        const data = await getAvailableSlots(doctorId, selectedDate);
        setSlots(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load consultation slots.');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (doctorId && selectedDate) {
      fetchSlots();
    }
  }, [doctorId, selectedDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !selectedDate || !selectedSlot) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const appointment = await bookAppointment({
        doctorId,
        date: selectedDate,
        startTime: selectedSlot,
        symptoms: symptoms.trim() || reason.trim(),
        reason: reason.trim(),
        patientNotes: patientNotes.trim(),
      });

      setConfirmedAppointment(appointment);
    } catch (err: any) {
      // Handles 409 conflict and validation errors
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to book appointment. The selected slot may no longer be available.'
      );
      // Refresh slots on failure to show latest availability
      if (doctorId && selectedDate) {
        getAvailableSlots(doctorId, selectedDate)
          .then(setSlots)
          .catch(() => {});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoctor) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading practitioner profile...
        </p>
      </div>
    );
  }

  if (confirmedAppointment) {
    return (
      <div className="container dashboard-container" style={{ maxWidth: '680px' }}>
        <div className="glass-card confirmation-card">
          <div className="confirmation-icon-circle">
            <CheckCircle2 size={42} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem' }}>
            Appointment Confirmed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Your consultation has been successfully booked with <strong>{confirmedAppointment.doctorName}</strong>.
          </p>

          <div className="confirmation-details-box">
            <div className="conf-item">
              <span className="conf-label">Doctor</span>
              <span className="conf-value">{confirmedAppointment.doctorName}</span>
            </div>
            <div className="conf-item">
              <span className="conf-label">Consultation Date</span>
              <span className="conf-value">{confirmedAppointment.date}</span>
            </div>
            <div className="conf-item">
              <span className="conf-label">Time Window</span>
              <span className="conf-value">
                {confirmedAppointment.startTime} – {confirmedAppointment.endTime}
              </span>
            </div>
            <div className="conf-item">
              <span className="conf-label">Appointment ID</span>
              <span className="conf-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {confirmedAppointment.id}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
            <Link to="/patient/appointments" className="btn btn-primary">
              <span>View My Appointments</span>
            </Link>
            <Link to="/patient/doctors" className="btn btn-outline">
              <span>Find Another Doctor</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/doctors" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <h1 className="welcome-title" style={{ fontSize: '1.85rem', marginTop: '0.5rem' }}>
          Book Consultation
        </h1>
        <p className="welcome-subtitle">
          Select an available date and consultation slot with {doctor?.name}.
        </p>
      </div>

      {doctor && (
        <div className="glass-card info-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="doctor-avatar" style={{ width: '52px', height: '52px' }}>
              <Stethoscope size={28} color="#10b981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{doctor.name}</h3>
                <span className="specialization-badge">{doctor.specialization}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={13} />
                  <span>{doctor.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} color="var(--primary)" />
                  <span>{doctor.slotDuration} min consultation slots</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBook} className="glass-card form-card">
        <div className="form-group">
          <label className="form-label" htmlFor="appointmentDate">
            <Calendar size={15} style={{ display: 'inline', marginRight: '0.35rem' }} />
            1. Select Consultation Date *
          </label>
          <input
            id="appointmentDate"
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            style={{ maxWidth: '320px' }}
          />
        </div>

        <div style={{ margin: '1.75rem 0' }}>
          <label className="form-label" style={{ marginBottom: '0.75rem' }}>
            2. Choose Time Slot *
          </label>
          <SlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            isLoading={isLoadingSlots}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="patientSymptoms">
            <FileText size={15} style={{ display: 'inline', marginRight: '0.35rem' }} />
            3. Patient Symptoms (Required for Intake) *
          </label>
          <textarea
            id="patientSymptoms"
            className="form-input"
            rows={3}
            placeholder="Describe your current symptoms (e.g., headache and fever for 2 days, sharp pain in lower back when bending)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
            maxLength={1000}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="consultReason">
            <FileText size={15} style={{ display: 'inline', marginRight: '0.35rem' }} />
            4. Reason for Visit / Chief Complaint (Optional)
          </label>
          <textarea
            id="consultReason"
            className="form-input"
            rows={2}
            placeholder="Briefly describe general category or visit context (e.g. Routine follow-up, specialist consultation)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="patientNotes">
            <FileText size={15} style={{ display: 'inline', marginRight: '0.35rem' }} />
            5. Additional Background Notes (Optional)
          </label>
          <textarea
            id="patientNotes"
            className="form-input"
            rows={2}
            placeholder="Any past medical history, current medications, or notes for the doctor..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Link to="/patient/doctors" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !selectedSlot || !selectedDate}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Securing Slot...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Confirm & Book Appointment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
