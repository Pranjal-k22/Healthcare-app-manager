import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAppointmentById } from '../../services/appointmentApi';
import { getClinicalRecord, getPrescription } from '../../services/clinicalApi';
import { Appointment } from '../../types/appointment';
import { ClinicalRecord, Prescription } from '../../types/clinical';
import { AppointmentStatusBadge } from '../../components/appointment/AppointmentStatusBadge';
import { PrescriptionCard } from '../../components/clinical/PrescriptionCard';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mail,
  Sparkles,
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
    return (
      <div className="container dashboard-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner" style={{ width: '36px', height: '36px', margin: '0 auto' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading appointment record & clinical summary...
        </p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container dashboard-container">
        <Link to="/patient/appointments" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to My Appointments</span>
        </Link>
        <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error || 'Appointment record not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/appointments" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to My Appointments</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <h1 className="welcome-title" style={{ fontSize: '1.85rem' }}>
              Consultation Record
            </h1>
            <p className="welcome-subtitle">
              Appointment summary, practitioner findings, and verified prescription.
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>

      {/* Doctor & Appointment Meta Card */}
      <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="doctor-avatar" style={{ width: '42px', height: '42px' }}>
                <Stethoscope size={22} color="#10b981" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Practitioner
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{appointment.doctorName}</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Mail size={14} />
              <span>{appointment.doctorEmail}</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div className="doctor-avatar" style={{ width: '42px', height: '42px', background: 'rgba(14, 165, 233, 0.12)' }}>
                <Calendar size={22} color="var(--primary)" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Consultation Date & Time
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

        {/* Reported Symptoms & Reason for Visit */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Reported Symptoms & Intake Reason
          </span>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {appointment.symptoms || appointment.reason || 'No specific symptoms entered.'}
          </p>
        </div>
      </div>

      {/* Post-Visit AI Patient Summary */}
      {clinicalRecord?.aiStatus === 'READY' && clinicalRecord.postVisitSummary ? (
        <div
          className="glass-card info-card"
          style={{
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="doctor-avatar" style={{ width: '38px', height: '38px', background: 'rgba(16, 185, 129, 0.18)' }}>
              <Sparkles size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Post-Visit Patient Summary
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                AI-synthesized care guidance & medication schedule
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '1rem 1.15rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-line',
            }}
          >
            {clinicalRecord.postVisitSummary}
          </div>
        </div>
      ) : clinicalRecord?.aiStatus === 'FAILED' ? (
        <div
          className="glass-card info-card"
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            background: 'rgba(15, 23, 42, 0.4)',
          }}
        >
          <Sparkles size={16} color="var(--text-muted)" />
          <span>Post-visit summary unavailable.</span>
        </div>
      ) : null}

      {/* Doctor Clinical Advice & Instructions */}
      {clinicalRecord && (
        <div className="glass-card info-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Clinical Findings & Advice</h3>
          </div>

          {clinicalRecord.diagnosisNotes && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Primary Diagnosis
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
                {clinicalRecord.diagnosisNotes}
              </p>
            </div>
          )}

          {clinicalRecord.patientInstructions && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Doctor's Instructions & Care Guidance
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.6 }}>
                {clinicalRecord.patientInstructions}
              </p>
            </div>
          )}

          {clinicalRecord.followUpDate && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(14, 165, 233, 0.08)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem' }}>
                Recommended Follow-up Date: <strong>{clinicalRecord.followUpDate}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Structured Prescription Display */}
      {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <PrescriptionCard prescription={prescription} />
        </div>
      ) : appointment.status === 'COMPLETED' ? (
        <div className="glass-card info-card" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <FileText size={32} style={{ margin: '0 auto 0.5rem' }} />
          <p>No medications were prescribed during this consultation.</p>
        </div>
      ) : null}
    </div>
  );
};
