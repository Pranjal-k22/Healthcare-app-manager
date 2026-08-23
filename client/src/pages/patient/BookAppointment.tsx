import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDoctorById } from '../../services/doctorApi';
import { bookAppointment, getAvailableSlots, holdSlot } from '../../services/appointmentApi';
import { Doctor } from '../../types/doctor';
import { Appointment, AvailableSlot } from '../../types/appointment';
import { SlotPicker } from '../../components/appointment/SlotPicker';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import InlineAlert from '../../components/ui/InlineAlert';
import { useToast } from '../../components/ui/Toast';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  DollarSign,
  Building2,
} from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  // Auto-select nearest working day (if today is Sunday, default to Monday)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    if (today.getDay() === 0) { // Sunday -> default to Monday
      const monday = new Date(today);
      monday.setDate(today.getDate() + 1);
      return monday.toISOString().split('T')[0];
    }
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isHoldingSlot, setIsHoldingSlot] = useState<boolean>(false);
  const [symptoms, setSymptoms] = useState('');
  const [reason, setReason] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const consultationFee = 75; // Standard consultation fee

  // Helper date generators for quick selector buttons
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getNextMondayStr = () => {
    const d = new Date();
    const day = d.getDay();
    const addDays = day === 0 ? 1 : (8 - day);
    d.setDate(d.getDate() + addDays);
    return d.toISOString().split('T')[0];
  };

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
        setHoldExpiresAt(null);
        setSecondsRemaining(0);
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

  // Countdown timer for active slot hold
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsRemaining(0);
        setError('Your 5-minute hold on this slot has expired. Please reselect the slot to hold it again.');
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const handleSelectSlot = async (slotTime: string) => {
    if (!doctorId || !selectedDate) return;
    setError(null);
    setIsHoldingSlot(true);
    try {
      const hold = await holdSlot({
        doctorId,
        date: selectedDate,
        startTime: slotTime,
      });
      setSelectedSlot(slotTime);
      const expDate = new Date(hold.expiresAt);
      setHoldExpiresAt(expDate);
      setSecondsRemaining(Math.max(0, Math.floor((expDate.getTime() - Date.now()) / 1000)));
      success(`Slot ${slotTime} reserved for 5 minutes.`, 'Slot Held');
    } catch (err: any) {
      setSelectedSlot(null);
      setHoldExpiresAt(null);
      setSecondsRemaining(0);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'This slot is currently held by another patient or unavailable. Please choose another slot.';
      setError(errMsg);
      toastError(errMsg, 'Slot Unavailable');
      if (doctorId && selectedDate) {
        getAvailableSlots(doctorId, selectedDate).then(setSlots).catch(() => {});
      }
    } finally {
      setIsHoldingSlot(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !selectedDate || !selectedSlot) return;

    if (holdExpiresAt && secondsRemaining <= 0) {
      setError('Your 5-minute reservation on this slot has expired. Please click the slot again to hold it.');
      return;
    }

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
      setCurrentStep(4);
      success('Appointment confirmed successfully!', 'Booking Complete');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to book appointment. The selected slot may no longer be available.';
      setError(errMsg);
      toastError(errMsg, 'Booking Error');
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
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="btn-spinner" style={{ width: '36px', height: '36px', margin: '0 auto', borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading doctor consultation schedule...
        </p>
      </div>
    );
  }

  // Step 4: Booking Confirmation Screen
  if (confirmedAppointment || currentStep === 4) {
    return (
      <div className="container" style={{ maxWidth: '720px', padding: '2.5rem 1.5rem' }}>
        <Card noPadding style={{ overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ background: 'var(--gradient-brand)', color: 'var(--white)', padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <CheckCircle2 size={36} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>
              Appointment Confirmed!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px' }}>
              Your consultation reference has been registered with hospital administration.
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'left',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <div className="helper-text">Practitioner / Specialist</div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {confirmedAppointment?.doctorName || doctor?.name}
                </div>
              </div>
              <div>
                <div className="helper-text">Department / Specialization</div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--primary)', marginTop: '2px' }}>
                  {doctor?.specialization || 'Clinical Medicine'}
                </div>
              </div>
              <div>
                <div className="helper-text">Consultation Date</div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {confirmedAppointment?.date || selectedDate}
                </div>
              </div>
              <div>
                <div className="helper-text">Time Window</div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {confirmedAppointment?.startTime || selectedSlot} – {confirmedAppointment?.endTime || ''}
                </div>
              </div>
              <div>
                <div className="helper-text">Consultation Fee</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--success)', marginTop: '2px' }}>
                  ${consultationFee}.00 USD (Covered / Invoiced)
                </div>
              </div>
              <div>
                <div className="helper-text">Appointment ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {confirmedAppointment?.id || 'CONF-REF-LIVE'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/patient/appointments">
                <Button variant="primary" size="md">
                  View My Appointments
                </Button>
              </Link>
              <Link to="/patient/doctors">
                <Button variant="outline" size="md">
                  Find Another Doctor
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 500, fontSize: '14px', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Doctor Directory</span>
        </Link>
        <h1 className="page-title" style={{ fontSize: '28px' }}>Book Specialist Consultation</h1>
        <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
          Reserve your preferred consultation slot with {doctor?.name}.
        </p>
      </div>

      {/* Multi-stage Stepper */}
      <div className="booking-stepper">
        <div className={`step-item ${currentStep >= 1 ? 'is-active' : ''} ${selectedSlot ? 'is-completed' : ''}`}>
          <div className="step-circle">{selectedSlot ? '✓' : '1'}</div>
          <span className="step-label">1. Specialist & Slot</span>
        </div>
        <div className="step-divider" />
        <div className={`step-item ${currentStep >= 2 ? 'is-active' : ''} ${symptoms ? 'is-completed' : ''}`}>
          <div className="step-circle">{symptoms ? '✓' : '2'}</div>
          <span className="step-label">2. Symptoms & Intake</span>
        </div>
        <div className="step-divider" />
        <div className={`step-item ${currentStep >= 3 ? 'is-active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-label">3. Fee & Confirm</span>
        </div>
      </div>

      {/* Doctor Summary Card */}
      {doctor && (
        <Card style={{ marginBottom: '1.5rem', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(0, 98, 204, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{doctor.name}</h3>
                <span className="role-badge badge-doctor">{doctor.specialization}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="var(--primary)" />
                  <span>Main Hospital Campus</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--primary)" />
                  <span>{doctor.slotDuration} min consultation slots</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <InlineAlert
          type="danger"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Booking Form */}
      <form onSubmit={handleBook}>
        <Card title="Select Date & Time Slot" icon={<Calendar size={18} />} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ maxWidth: '300px', marginBottom: 0 }}>
              <Input
                id="appointmentDate"
                type="date"
                label="Consultation Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                leftIcon={<Calendar size={16} />}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2px', flexWrap: 'wrap' }}>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: selectedDate === getTodayStr() ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedDate === getTodayStr() ? 'rgba(0, 98, 204, 0.1)' : 'var(--surface)',
                  color: selectedDate === getTodayStr() ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(getTodayStr())}
              >
                Today ({getTodayStr().slice(5)})
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: selectedDate === getTomorrowStr() ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedDate === getTomorrowStr() ? 'rgba(0, 98, 204, 0.1)' : 'var(--surface)',
                  color: selectedDate === getTomorrowStr() ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(getTomorrowStr())}
              >
                Tomorrow ({getTomorrowStr().slice(5)})
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: selectedDate === getNextMondayStr() ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedDate === getNextMondayStr() ? 'rgba(0, 98, 204, 0.1)' : 'var(--surface)',
                  color: selectedDate === getNextMondayStr() ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(getNextMondayStr())}
              >
                Next Monday ({getNextMondayStr().slice(5)})
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <label className="form-field-label">Available Slots for {selectedDate} *</label>
            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              isLoading={isLoadingSlots || isHoldingSlot}
            />
          </div>

          {selectedSlot && secondsRemaining > 0 && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '12px 16px',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#155724', fontWeight: 600, fontSize: '14px' }}>
                <Clock size={16} />
                <span>Slot Reserved: {selectedSlot} ({selectedDate})</span>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: secondsRemaining < 60 ? 'var(--danger)' : 'var(--success)',
                  backgroundColor: 'var(--white)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                Reservation expires in: {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </Card>

        <Card title="Patient Intake & Medical Reason" icon={<FileText size={18} />} style={{ marginBottom: '1.5rem' }}>
          <Textarea
            id="patientSymptoms"
            label="Current Symptoms (Required for Intake)"
            rows={3}
            placeholder="Describe your current symptoms (e.g., persistent fever, headache, muscle ache for 2 days)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            required
            maxLength={1000}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginTop: '0.4rem',
              marginBottom: '1.25rem',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 98, 204, 0.04)',
              border: '1px solid rgba(0, 98, 204, 0.15)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
            }}
          >
            <Sparkles size={14} color="var(--primary, #0062cc)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>AI Triage Notice:</strong> In this demonstration environment, intake symptoms are synthesized securely via cloud AI (Google Gemini) to prepare preliminary clinical context for your physician.
            </span>
          </div>

          <Textarea
            id="consultReason"
            label="Reason for Visit / Chief Complaint (Optional)"
            rows={2}
            placeholder="e.g. Routine follow-up, specialist consultation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />

          <Textarea
            id="patientNotes"
            label="Additional Background / Notes for Doctor (Optional)"
            rows={2}
            placeholder="Any past medical history, current medications, or questions for the doctor..."
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            maxLength={1000}
          />
        </Card>

        <Card title="Fee Review & Confirmation" icon={<DollarSign size={18} />} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--surface-alt)' }}>
            <span className="body-text">Specialist Consultation Fee</span>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>${consultationFee}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--surface-alt)' }}>
            <span className="body-text">Platform & Booking Fee</span>
            <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--success)' }}>$0.00 (Waived)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0 0' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Due at Visit</span>
            <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--primary)' }}>${consultationFee}.00 USD</span>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/patient/doctors">
            <Button variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || !selectedSlot || !selectedDate || secondsRemaining <= 0 || isHoldingSlot}
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck size={16} />}
          >
            Confirm & Book Appointment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
