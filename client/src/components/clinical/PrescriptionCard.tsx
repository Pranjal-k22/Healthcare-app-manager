import React from 'react';
import { Prescription } from '../../types/clinical';
import { Clock, Info, Pill } from 'lucide-react';

interface PrescriptionCardProps {
  prescription: Prescription;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
}) => {
  const medicines = prescription.medicines || [];

  return (
    <div className="glass-card prescription-card">
      <div className="prescription-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="rx-badge">Rx</div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Medical Prescription</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Doctor-certified medication regimen
            </span>
          </div>
        </div>

        {prescription.createdAt && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Issued: {new Date(prescription.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {medicines.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No specific medications were prescribed for this consultation.
        </div>
      ) : (
        <div className="prescription-medicines-table">
          <div className="rx-table-header">
            <span>Medication & Dosage</span>
            <span>Frequency</span>
            <span>Duration</span>
            <span>Instructions</span>
          </div>

          <div className="rx-table-body">
            {medicines.map((med, i) => (
              <div key={med._id || i} className="rx-table-row">
                <div className="rx-cell-name">
                  <Pill size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <div>
                    <strong className="rx-med-title">{med.name}</strong>
                    <span className="rx-dosage-text">{med.dosage}</span>
                  </div>
                </div>

                <div className="rx-cell-freq">
                  <span className="rx-pill-badge">{med.frequency}</span>
                </div>

                <div className="rx-cell-dur">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span>{med.duration}</span>
                  </div>
                </div>

                <div className="rx-cell-inst">
                  <span>{med.instructions || 'As directed by physician'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescription.additionalInstructions && (
        <div className="rx-additional-notes">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Info size={14} color="var(--primary)" />
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              Doctor's General Advice & Instructions:
            </strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {prescription.additionalInstructions}
          </p>
        </div>
      )}
    </div>
  );
};
