import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAppointmentById, generateAiSummary } from '../../services/appointmentApi';
import {
  getClinicalRecord,
  getPrescription,
  saveClinicalRecord,
  savePrescription,
  completeConsultationWorkflow,
  generatePostVisitSummary,
} from '../../services/clinicalApi';
import { Appointment } from '../../types/appointment';
import { MedicineItem } from '../../types/clinical';
import { AppointmentStatusBadge } from '../../components/appointment/AppointmentStatusBadge';
import { PrescriptionEditor } from '../../components/clinical/PrescriptionEditor';
import { DualPreVisitSummaryView, DualPostVisitSummaryView } from '../../components/clinical/DualAiSummaryView';
import Button from '../../components/ui/Button';
import { formatDateIndian, formatTimeIndian } from '../../utils/dateUtils';
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
  Sparkles,
  User,
  Stethoscope,
  FileText,
} from 'lucide-react';


export const DoctorConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingPostAi, setIsGeneratingPostAi] = useState(false);
  const [postVisitAiSummary, setPostVisitAiSummary] = useState<any>(null);
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
          if ((record as any).postVisitSummary) {
            setPostVisitAiSummary((record as any).postVisitSummary);
          }
        }
      } catch (err) {
        // Record might not exist yet
      }

      if ((appData as any)?.postVisitSummary) {
        setPostVisitAiSummary((appData as any).postVisitSummary);
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

  const handleGenerateAiSummary = async () => {
    if (!appointmentId) return;
    try {
      setIsGeneratingAi(true);
      setError(null);
      const updated = await generateAiSummary(appointmentId);
      setAppointment(updated);
      setSuccessMsg('Pre-Visit AI Clinical Summary synthesized successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate AI summary.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleGeneratePostVisitAi = async () => {
    if (!appointmentId) return;
    if (!clinicalNotes.trim()) {
      setError('Please enter clinical examination notes before generating the Post-Visit AI summary.');
      return;
    }

    try {
      setIsGeneratingPostAi(true);
      setError(null);
      setSuccessMsg(null);

      const result = await generatePostVisitSummary(appointmentId, {
        clinicalNotes: clinicalNotes.trim(),
        medicines,
      });

      if (result.postVisitSummary) {
        setPostVisitAiSummary(result.postVisitSummary);
        setSuccessMsg('✨ Post-Visit AI Care Plan & Medication Guidance synthesized successfully!');
      } else {
        setError('Local AI returned an unexpected response structure.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate Post-Visit AI summary.');
    } finally {
      setIsGeneratingPostAi(false);
    }
  };

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

    if (medicines.length === 0) {
      setError('Please add at least one medication to save the prescription.');
      return;
    }

    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      if (!m.name.trim() || !m.dosage.trim() || !m.frequency.trim()) {
        setError(`Medication #${i + 1} is missing Name, Dosage, or Frequency.`);
        return;
      }
    }

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
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1.25rem', fontWeight: 500 }}>
          Opening Doctor Consultation Room...
        </p>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="container dashboard-container" style={{ maxWidth: '960px', padding: '2rem 1.5rem' }}>
        <Link to="/doctor/appointments" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#0062cc', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to Consultation Queue</span>
        </Link>
        <div className="alert alert-error" style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
    <div className="container dashboard-container" style={{ maxWidth: '1020px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Top Breadcrumb & Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/doctor/appointments"
          className="back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#0062cc',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Consultation Queue</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0062cc, #00c6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Stethoscope size={20} />
              </div>
              <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                Consultation Room
              </h1>
            </div>
            <p className="helper-text" style={{ fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
              Clinical examination, AI pre-visit synthesis, and prescription management.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="var(--danger)" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Profile & Schedule Card */}
      <div className="consultation-patient-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Patient Details */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(96, 165, 250, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              <User size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                PATIENT PROFILE
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem', marginBottom: '0.25rem' }}>
                {appointment.patientName}
              </h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Mail size={13} color="var(--text-muted)" />
                <span>{appointment.patientEmail}</span>
              </div>
            </div>
          </div>

          {/* Consultation Schedule Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(74, 222, 128, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
                flexShrink: 0,
              }}
            >
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                SCHEDULED SLOT
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem', marginBottom: '0.25rem' }}>
                {formatDateIndian(appointment.date)}
              </h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Clock size={13} color="var(--text-muted)" />
                <span style={{ fontWeight: 600 }}>
                  {formatTimeIndian(appointment.startTime, false)} – {formatTimeIndian(appointment.endTime, false)} IST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Intake Raw Symptoms Banner */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
            <Activity size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient Reported Symptoms (Intake)
            </span>
          </div>
          <div className="consultation-symptoms-box">
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {appointment.symptoms || appointment.reason || 'No specific symptoms entered.'}
            </p>
            {appointment.patientNotes && (
              <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Additional Notes:</strong> {appointment.patientNotes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Visit AI Clinical Intake Summary Card (Dual-Engine) */}
      {appointment.aiStatus === 'READY' && appointment.preVisitSummary ? (
        <DualPreVisitSummaryView
          summary={appointment.preVisitSummary}
          onRefresh={handleGenerateAiSummary}
          isRefreshing={isGeneratingAi}
        />
      ) : appointment.aiStatus === 'FAILED' ? (
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={18} color="#0062cc" />
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                Pre-Visit AI Clinical Summary is ready to synthesize
              </span>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Analyze patient symptoms and generate clinical intake recommendations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiSummary}
            disabled={isGeneratingAi}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #0062cc',
              background: '#ffffff',
              color: '#0062cc',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            {isGeneratingAi ? 'Synthesizing with Ollama...' : 'Generate AI Summary'}
          </button>
        </div>
      ) : appointment.aiStatus === 'PENDING' ? (
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
            border: '1.5px dashed #38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Sparkles size={18} color="#0284c7" />
          <span style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 600 }}>
            AI Clinical Assistant is analyzing patient intake symptoms...
          </span>
        </div>
      ) : null}

      {/* Clinical Notes & Diagnostic Section */}
      <div className="consultation-clinical-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Clinical Examination & Findings
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Document physician notes, diagnostic impressions, and care plan
            </span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="clinicalNotes" style={{ display: 'block', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
            Clinical Observations & Examination Findings <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            id="clinicalNotes"
            className="form-input-ui form-textarea-ui"
            rows={4}
            placeholder="Record doctor physical examination observations, vital indicators, clinical history, and diagnostic findings..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            required
            maxLength={5000}
          />
          <div className="consultation-ai-hint-box">
            <Sparkles size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>AI Discharge Synthesis:</strong> In this demonstration environment, finalized clinical notes and medication instructions are synthesized via cloud AI (Google Gemini) to generate patient-friendly discharge summaries.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="diagnosisNotes" style={{ display: 'block', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              Primary Diagnosis / Clinical Impression
            </label>
            <input
              id="diagnosisNotes"
              type="text"
              className="form-input-ui"
              placeholder="e.g. Acute Viral Bronchitis, Essential Hypertension"
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              disabled={isCompleted || isCancelled || isSubmitting}
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="followUpDate" style={{ display: 'block', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              Recommended Follow-up Date
            </label>
            <input
              id="followUpDate"
              type="date"
              className="form-input-ui"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              disabled={isCompleted || isCancelled || isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="patientInstructions" style={{ display: 'block', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
            Patient-Facing Instructions & Lifestyle Advice
          </label>
          <textarea
            id="patientInstructions"
            className="form-input-ui form-textarea-ui"
            rows={3}
            placeholder="Clear, patient-friendly guidance (e.g. Rest for 3 days, drink plenty of fluids, monitor blood pressure daily)..."
            value={patientInstructions}
            onChange={(e) => setPatientInstructions(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            maxLength={3000}
          />
        </div>

        {!isCompleted && !isCancelled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveNotes}
              disabled={isSubmitting || !clinicalNotes.trim()}
              leftIcon={<Save size={15} />}
            >
              Save Clinical Notes Draft
            </Button>
          </div>
        )}
      </div>

      {/* Structured Prescription Section */}
      <div className="consultation-clinical-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(45, 212, 191, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2DD4BF' }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Structured Medical Prescription
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Add medication names, exact dosages, frequencies, and durations
            </span>
          </div>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleSavePrescription}
              disabled={isSubmitting}
              leftIcon={<Save size={15} />}
            >
              Save Prescription Draft
            </Button>
          </div>
        )}
      </div>

      {/* Post-Visit AI Clinical Synthesis & Care Guidance Card */}
      <div className="consultation-postvisit-ai-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Post-Visit AI Care Plan & Patient Guidance
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF', fontWeight: 700 }}>
                  Clinical AI Engine
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Synthesizes clinical examination findings & prescription into plain-English patient instructions.
              </span>
            </div>
          </div>

          {!isCompleted && !isCancelled && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePostVisitAi}
              disabled={isGeneratingPostAi || !clinicalNotes.trim()}
              leftIcon={<Sparkles size={16} />}
            >
              {isGeneratingPostAi ? 'Synthesizing Care Plan...' : '✨ Generate Post-Visit AI Summary'}
            </Button>
          )}
        </div>

        {/* AI Result Card or Placeholder */}
        {postVisitAiSummary ? (
          <DualPostVisitSummaryView
            summary={postVisitAiSummary}
            onRefresh={handleGeneratePostVisitAi}
            isRefreshing={isGeneratingPostAi}
          />
        ) : (
          <div className="consultation-ai-placeholder">
            <Sparkles size={20} color="#2DD4BF" style={{ margin: '0 auto 0.4rem auto', display: 'block' }} />
            <span>
              Click <strong>"Generate Post-Visit AI Summary"</strong> above to send clinical observations and prescription to preview the AI care guidance before finalizing.
            </span>
          </div>
        )}
      </div>

      {/* Final Action Bar */}
      {!isCompleted && !isCancelled ? (
        <div className="consultation-finalize-bar">
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text, #A7F3D0)', margin: 0 }}>
              Ready to Finalize Consultation?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', marginBottom: 0 }}>
              Finalizing saves clinical notes, issues e-prescription, and triggers patient post-visit AI guidance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/doctor/appointments">
              <Button variant="outline" size="md">
                Close
              </Button>
            </Link>
            <Button
              variant="success"
              size="md"
              onClick={handleCompleteConsultation}
              disabled={isSubmitting || !clinicalNotes.trim()}
              isLoading={isSubmitting}
              leftIcon={!isSubmitting ? <ShieldCheck size={18} /> : undefined}
            >
              Complete Consultation
            </Button>
          </div>
        </div>
      ) : (
        <div className="consultation-completed-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="var(--success)" />
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                This consultation has been finalized and completed.
              </strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem', marginBottom: 0 }}>
                Clinical notes and prescriptions are locked and available to the patient.
              </p>
            </div>
          </div>
          <Link to="/doctor/appointments">
            <Button variant="outline" size="sm">
              Return to Queue
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
