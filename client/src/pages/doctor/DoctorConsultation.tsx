import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById } from '../../services/appointmentApi';
import {
  getClinicalRecord,
  getPrescription,
  saveClinicalRecord,
  savePrescription,
  completeConsultationWorkflow,
} from '../../services/clinicalApi';
import { Appointment } from '../../types/appointment';
import { MedicineItem } from '../../types/clinical';
import { AppointmentStatusBadge } from '../../components/appointment/AppointmentStatusBadge';
import { PrescriptionEditor } from '../../components/clinical/PrescriptionEditor';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Mail,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react';

export const DoctorConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clinical Notes State
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [patientInstructions, setPatientInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState<string>('');

  // Prescription State
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const loadConsultationData = async () => {
    if (!appointmentId) return;
    try {
      setIsLoading(true);
      setError(null);

      const appData = await getAppointmentById(appointmentId);
      setAppointment(appData);

      // Fetch existing clinical record if any
      try {
        const record = await getClinicalRecord(appointmentId);
        if (record) {
          setClinicalNotes(record.clinicalNotes || '');
          setDiagnosisNotes(record.diagnosisNotes || '');
          setPatientInstructions(record.patientInstructions || '');
          setFollowUpDate(record.followUpDate || '');
        }
      } catch (err) {
        // Record might not exist yet
      }

      // Fetch existing prescription if any
      try {
        const rx = await getPrescription(appointmentId);
        if (rx) {
          setMedicines(rx.medicines || []);
          setAdditionalInstructions(rx.additionalInstructions || '');
        }
      } catch (err) {
        // Prescription might not exist yet
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load consultation room data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsultationData();
  }, [appointmentId]);

  const handleSaveNotes = async () => {
    if (!appointmentId) return;
    if (!clinicalNotes.trim()) {
      setError('Clinical notes cannot be empty before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await saveClinicalRecord(appointmentId, {
        clinicalNotes: clinicalNotes.trim(),
        diagnosisNotes: diagnosisNotes.trim(),
        patientInstructions: patientInstructions.trim(),
        followUpDate: followUpDate || null,
      });

      setSuccessMsg('Clinical notes draft saved successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save clinical notes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!appointmentId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      await savePrescription(appointmentId, {
        medicines,
        additionalInstructions: additionalInstructions.trim(),
      });

      setSuccessMsg('Prescription saved successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save prescription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!appointmentId) return;

    if (!clinicalNotes.trim()) {
      setError('Please enter clinical notes before finalizing and completing the visit.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const result = await completeConsultationWorkflow(appointmentId, {
        clinicalNotes: clinicalNotes.trim(),
        diagnosisNotes: diagnosisNotes.trim(),
        patientInstructions: patientInstructions.trim(),
        followUpDate: followUpDate || null,
        medicines,
        additionalInstructions: additionalInstructions.trim(),
      });

      setAppointment(result.appointment);
      setSuccessMsg('Consultation finalized and marked as COMPLETED.');
      navigate('/doctor/appointments', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to finalize consultation.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Opening Doctor Consultation Room...
        </p>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="container dashboard-container">
        <Link to="/doctor/appointments" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Consultation Queue</span>
        </Link>
        <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Appointment record not found.'}</span>
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  const isCompleted = appointment.status === 'COMPLETED';
  const isCancelled = appointment.status === 'CANCELLED';

  return (
    <div className="container dashboard-container" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/doctor/appointments" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Consultation Queue</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
              Consultation Room
            </h1>
            <p className="welcome-subtitle">
              Clinical examination, findings documentation, and structured prescription management.
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Patient & Appointment Summary Card */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Patient Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="doctor-avatar" style={{ width: '40px', height: '40px', background: 'rgba(14, 165, 233, 0.12)' }}>
                <User size={20} color="var(--primary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Patient Profile
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{appointment.patientName}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Mail size={14} />
              <span>{appointment.patientEmail}</span>
            </div>
          </div>

          {/* Consultation Schedule Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="doctor-avatar" style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.12)' }}>
                <Calendar size={20} color="#10b981" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Slot Schedule
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{appointment.date}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Clock size={14} color="var(--primary)" />
              <span>
                {appointment.startTime} – {appointment.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Intake Reasons & Notes */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Chief Complaint / Reason
            </span>
            <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {appointment.reason || 'No specific symptoms entered.'}
            </p>
          </div>

          {appointment.patientNotes && (
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Additional Patient Background
              </span>
              <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {appointment.patientNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Notes & Diagnosis Section */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Activity size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Clinical Notes & Diagnostic Findings</h3>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="clinicalNotes">
            Clinical Observations & Examination Findings *
          </label>
          <textarea
            id="clinicalNotes"
            className="form-input"
            rows={4}
            placeholder="Record doctor physical examination observations, vital indicators, clinical history, and clinical impressions..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            required
            maxLength={5000}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="diagnosisNotes">
              Primary Diagnosis / Clinical Impression
            </label>
            <input
              id="diagnosisNotes"
              type="text"
              className="form-input"
              placeholder="e.g. Acute Bronchitis, Essential Hypertension"
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              disabled={isCompleted || isCancelled || isSubmitting}
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="followUpDate">
              Recommended Follow-up Date
            </label>
            <input
              id="followUpDate"
              type="date"
              className="form-input"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={isCompleted || isCancelled || isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="patientInstructions">
            Patient-Facing Instructions & Lifestyle Advice
          </label>
          <textarea
            id="patientInstructions"
            className="form-input"
            rows={3}
            placeholder="Clear, patient-friendly guidance (e.g. Rest for 3 days, drink warm water, monitor blood pressure daily)..."
            value={patientInstructions}
            onChange={(e) => setPatientInstructions(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            maxLength={3000}
          />
        </div>

        {!isCompleted && !isCancelled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSaveNotes}
              disabled={isSubmitting || !clinicalNotes.trim()}
            >
              <Save size={14} />
              <span>Save Clinical Notes</span>
            </button>
          </div>
        )}
      </div>

      {/* Structured Prescription Section */}
      <div className="glass-card info-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <FileSpreadsheet size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Structured Medical Prescription</h3>
        </div>

        <PrescriptionEditor
          medicines={medicines}
          onChangeMedicines={setMedicines}
          additionalInstructions={additionalInstructions}
          onChangeAdditionalInstructions={setAdditionalInstructions}
          disabled={isCompleted || isCancelled || isSubmitting}
        />

        {!isCompleted && !isCancelled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSavePrescription}
              disabled={isSubmitting}
            >
              <Save size={14} />
              <span>Save Prescription</span>
            </button>
          </div>
        )}
      </div>

      {/* Final Action Bar */}
      {!isCompleted && !isCancelled ? (
        <div
          className="glass-card"
          style={{
            padding: '1.5rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ready to finalize consultation?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Finalizing will save all clinical notes, issue the prescription, and mark visit as completed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/doctor/appointments" className="btn btn-outline">
              Close Without Finalizing
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCompleteConsultation}
              disabled={isSubmitting || !clinicalNotes.trim()}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Finalizing Visit...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Complete Consultation</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="alert alert-success" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <div>
              <strong>This consultation has been finalized and completed.</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                All clinical records and prescriptions are securely stored and available to the patient.
              </p>
            </div>
          </div>
          <Link to="/doctor/appointments" className="btn btn-outline btn-sm">
            Return to Queue
          </Link>
        </div>
      )}
    </div>
  );
};
