import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAppointmentById } from '../../services/appointmentApi';
import { getClinicalRecord, getPrescription } from '../../services/clinicalApi';
import { Appointment } from '../../types/appointment';
import { ClinicalRecord, Prescription } from '../../types/clinical';
import { AppointmentStatusBadge } from '../../components/appointment/AppointmentStatusBadge';
import { PrescriptionCard } from '../../components/clinical/PrescriptionCard';
import { DualPreVisitSummaryView, DualPostVisitSummaryView } from '../../components/clinical/DualAiSummaryView';
import { formatDateIndian, formatTimeIndian } from '../../utils/dateUtils';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mail,
  Stethoscope,
} from 'lucide-react';

export const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);

        const appData = await getAppointmentById(id);
        setAppointment(appData);

        // Fetch clinical record if available
        try {
          const record = await getClinicalRecord(id);
          setClinicalRecord(record);
        } catch (err) {
          // Might not have clinical record
        }

        // Fetch prescription if available
        try {
          const rx = await getPrescription(id);
          setPrescription(rx);
        } catch (err) {
          // Might not have prescription
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load appointment details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullDetails();
  }, [id]);

  if (isLoading) {
    return <LoadingScreen message="Loading appointment record & clinical summaries..." />;
  }

  if (error || !appointment) {
    return (
      <div className="container dashboard-container" style={{ maxWidth: '920px', padding: '2rem 1.5rem', margin: '0 auto' }}>
        <Link
          to="/patient/appointments"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Appointments</span>
        </Link>
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error || 'Appointment record not found.'}</span>
        </div>
      </div>
    );
  }

  const preSummary = appointment.preVisitSummary;
  const postSummary = clinicalRecord?.postVisitSummary || appointment.postVisitSummary;

  return (
    <div className="container dashboard-container" style={{ maxWidth: '960px', padding: '2rem 1.5rem', margin: '0 auto' }}>
      {/* Top Breadcrumb & Title Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to="/patient/appointments"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#0284c7',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Appointments</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Consultation Record
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.35rem', marginBottom: 0 }}>
              Complete clinical timeline, AI intake synthesis, practitioner findings, and care plan.
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>

      {/* Practitioner & Appointment Details Meta Card */}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Practitioner Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Stethoscope size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  Practitioner
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Dr. {appointment.doctorName}
                </h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#64748b', fontSize: '0.85rem', paddingLeft: '0.25rem' }}>
              <Mail size={14} color="#94a3b8" />
              <span>{appointment.doctorEmail}</span>
            </div>
          </div>

          {/* Schedule Date & Time Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                  Consultation Date
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {formatDateIndian(appointment.date)}
                </h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#64748b', fontSize: '0.85rem', paddingLeft: '0.25rem' }}>
              <Clock size={14} color="#94a3b8" />
              <span>
                {formatTimeIndian(appointment.startTime, false)} – {formatTimeIndian(appointment.endTime, false)} IST
              </span>
            </div>
          </div>
        </div>

        {/* Reported Symptoms & Reason for Visit */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              marginTop: '0.15rem',
            }}
          >
            Reported Intake
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
            {appointment.symptoms || appointment.reason || 'No specific symptoms entered.'}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. Pre-Visit AI Symptom Summary Card (Dual-Engine) */}
      {/* ======================================================== */}
      {preSummary && <DualPreVisitSummaryView summary={preSummary} />}

      {/* ======================================================== */}
      {/* 2. Post-Visit AI Patient Summary Card (Dual-Engine) */}
      {/* ======================================================== */}
      {postSummary && <DualPostVisitSummaryView summary={postSummary} />}

      {/* ======================================================== */}
      {/* 3. Doctor's Clinical Findings & Examination Notes */}
      {/* ======================================================== */}
      {clinicalRecord && (
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
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Clinical Examination & Advice
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Physician observations, diagnostic impressions, and clinical guidance
              </span>
            </div>
          </div>

          {clinicalRecord.diagnosisNotes && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary Diagnosis
              </span>
              <div
                style={{
                  marginTop: '0.35rem',
                  display: 'inline-block',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#0369a1',
                }}
              >
                {clinicalRecord.diagnosisNotes}
              </div>
            </div>
          )}

          {clinicalRecord.clinicalNotes && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Physician Examination Observations
              </span>
              <p style={{ marginTop: '0.35rem', fontSize: '0.92rem', color: '#334155', lineHeight: 1.65, background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                {clinicalRecord.clinicalNotes}
              </p>
            </div>
          )}

          {clinicalRecord.patientInstructions && (
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Doctor's Direct Lifestyle & Care Advice
              </span>
              <p style={{ marginTop: '0.35rem', fontSize: '0.92rem', color: '#334155', lineHeight: 1.65, background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                {clinicalRecord.patientInstructions}
              </p>
            </div>
          )}

          {clinicalRecord.followUpDate && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.15rem',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#166534',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <Calendar size={16} color="#15803d" />
              <span>
                Recommended Follow-up Date: <strong>{clinicalRecord.followUpDate}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. Structured Prescription Card */}
      {/* ======================================================== */}
      {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <PrescriptionCard prescription={prescription} />
        </div>
      ) : appointment.status === 'COMPLETED' ? (
        <div
          style={{
            padding: '2rem',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '2rem',
          }}
        >
          <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>No prescription was issued during this consultation.</p>
        </div>
      ) : null}
    </div>
  );
};
export default AppointmentDetails;
