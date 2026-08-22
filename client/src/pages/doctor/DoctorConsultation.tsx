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
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                Consultation Room
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>
              Clinical examination, AI pre-visit synthesis, and prescription management.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Profile & Schedule Card */}
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Patient Details */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 98, 204, 0.12), rgba(0, 198, 255, 0.12))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0062cc',
                flexShrink: 0,
              }}
            >
              <User size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Patient Profile
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem', marginBottom: '0.25rem' }}>
                {appointment.patientName}
              </h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Mail size={13} color="#94a3b8" />
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
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.12))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                flexShrink: 0,
              }}
            >
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Scheduled Slot
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem', marginBottom: '0.25rem' }}>
                {appointment.date}
              </h3>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Clock size={13} color="#94a3b8" />
                <span style={{ fontWeight: 600 }}>
                  {appointment.startTime} – {appointment.endTime}
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
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
            <Activity size={14} color="#0062cc" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient Reported Symptoms (Intake)
            </span>
          </div>
          <div
            style={{
              padding: '0.85rem 1.1rem',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #0062cc',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.5 }}>
              {appointment.symptoms || appointment.reason || 'No specific symptoms entered.'}
            </p>
            {appointment.patientNotes && (
              <p style={{ margin: '0.45rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(0, 98, 204, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0062cc' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Clinical Examination & Findings
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Document physician notes, diagnostic impressions, and care plan
            </span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="clinicalNotes" style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
            Clinical Observations & Examination Findings <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            id="clinicalNotes"
            className="form-input"
            rows={4}
            placeholder="Record doctor physical examination observations, vital indicators, clinical history, and diagnostic findings..."
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            required
            maxLength={5000}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a', fontFamily: 'inherit' }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginTop: '0.4rem',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            <Sparkles size={14} color="#0062cc" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: '#334155' }}>AI Discharge Synthesis:</strong> In this demonstration environment, finalized clinical notes and medication instructions are synthesized via cloud AI (Google Gemini) to generate patient-friendly discharge summaries.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="diagnosisNotes" style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              Primary Diagnosis / Clinical Impression
            </label>
            <input
              id="diagnosisNotes"
              type="text"
              className="form-input"
              placeholder="e.g. Acute Viral Bronchitis, Essential Hypertension"
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              disabled={isCompleted || isCancelled || isSubmitting}
              maxLength={2000}
              style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="followUpDate" style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
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
              style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="patientInstructions" style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
            Patient-Facing Instructions & Lifestyle Advice
          </label>
          <textarea
            id="patientInstructions"
            className="form-input"
            rows={3}
            placeholder="Clear, patient-friendly guidance (e.g. Rest for 3 days, drink plenty of fluids, monitor blood pressure daily)..."
            value={patientInstructions}
            onChange={(e) => setPatientInstructions(e.target.value)}
            disabled={isCompleted || isCancelled || isSubmitting}
            maxLength={3000}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a', fontFamily: 'inherit' }}
          />
        </div>

        {!isCompleted && !isCancelled && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isSubmitting || !clinicalNotes.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: !clinicalNotes.trim() ? 'not-allowed' : 'pointer',
                opacity: !clinicalNotes.trim() ? 0.6 : 1,
              }}
            >
              <Save size={15} />
              <span>Save Clinical Notes Draft</span>
            </button>
          </div>
        )}
      </div>

      {/* Structured Prescription Section */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Structured Medical Prescription
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
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
            <button
              type="button"
              onClick={handleSavePrescription}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Save size={15} />
              <span>Save Prescription Draft</span>
            </button>
          </div>
        )}
      </div>

      {/* Post-Visit AI Clinical Synthesis & Care Guidance Card (Gemini) */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(240, 253, 250, 0.7) 0%, #ffffff 100%)',
          borderRadius: '14px',
          border: '1.5px solid #99f6e4',
          boxShadow: '0 4px 18px rgba(13, 148, 136, 0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Post-Visit AI Care Plan & Patient Guidance
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                  Local AI (Ollama)
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Synthesizes clinical examination findings & prescription into plain-English patient instructions.
              </span>
            </div>
          </div>

          {!isCompleted && !isCancelled && (
            <button
              type="button"
              onClick={handleGeneratePostVisitAi}
              disabled={isGeneratingPostAi || !clinicalNotes.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                background: clinicalNotes.trim() ? '#0f766e' : '#94a3b8',
                color: '#ffffff',
                cursor: clinicalNotes.trim() && !isGeneratingPostAi ? 'pointer' : 'not-allowed',
                boxShadow: clinicalNotes.trim() ? '0 4px 12px rgba(15, 118, 110, 0.25)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={16} />
              <span>{isGeneratingPostAi ? 'Synthesizing Care Plan...' : '✨ Generate Post-Visit AI Summary'}</span>
            </button>
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
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.88rem',
            }}
          >
            <Sparkles size={20} color="#0d9488" style={{ margin: '0 auto 0.4rem auto', display: 'block' }} />
            <span>
              Click <strong>"Generate Post-Visit AI Summary"</strong> above to send the clinical observations and prescription to Google Gemini and preview the AI care guidance before finalizing.
            </span>
          </div>
        )}
      </div>

      {/* Final Action Bar */}
      {!isCompleted && !isCancelled ? (
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #86efac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.08)',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46', margin: 0 }}>
              Ready to Finalize Consultation?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.2rem', marginBottom: 0 }}>
              Finalizing saves clinical notes, issues e-prescription, and triggers patient post-visit AI guidance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/doctor/appointments"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Close
            </Link>
            <button
              type="button"
              onClick={handleCompleteConsultation}
              disabled={isSubmitting || !clinicalNotes.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: !clinicalNotes.trim()
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: !clinicalNotes.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !clinicalNotes.trim() ? 'none' : '0 4px 14px rgba(5, 150, 105, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  <span>Finalizing Visit...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Complete Consultation</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="#059669" />
            <div>
              <strong style={{ fontSize: '1rem', color: '#065f46' }}>
                This consultation has been finalized and completed.
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.15rem', marginBottom: 0 }}>
                Clinical notes and prescriptions are locked and available to the patient.
              </p>
            </div>
          </div>
          <Link
            to="/doctor/appointments"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #a7f3d0',
              background: '#ffffff',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Return to Queue
          </Link>
        </div>
      )}
    </div>
  );
};
