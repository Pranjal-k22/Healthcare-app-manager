import React from 'react';
import { Prescription } from '../../types/clinical';
import { Clock, Info, Pill, Calendar, FileCheck } from 'lucide-react';
import './PrescriptionCard.css';

interface PrescriptionCardProps {
  prescription: Prescription;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
}) => {
  const medicines = prescription.medicines || [];

  return (
    <div className="prescription-card">
      <div className="prescription-card-header">
        <div className="rx-brand-group">
          <div className="rx-badge">Rx</div>
          <div>
            <h3 className="rx-title">Medical Prescription</h3>
            <span className="rx-subtitle">
              Doctor-certified medication regimen
            </span>
          </div>
        </div>

        {prescription.createdAt && (
          <div className="rx-meta-pill">
            <Calendar size={13} />
            <span>Issued: {new Date(prescription.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {medicines.length === 0 ? (
        <div className="rx-empty-state">
          <FileCheck size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <div>No specific medications were prescribed for this consultation.</div>
        </div>
      ) : (
        <div className="prescription-medicines-table">
          <div className="rx-table-header">
            <div>Medication & Dosage</div>
            <div>Frequency</div>
            <div>Duration</div>
            <div>Clinical Instructions</div>
          </div>

          <div className="rx-table-body">
            {medicines.map((med, i) => (
              <div key={med._id || i} className="rx-table-row">
                {/* 1. Medication & Dosage */}
                <div className="rx-cell-name">
                  <div className="rx-pill-icon-wrap">
                    <Pill size={15} />
                  </div>
                  <div className="rx-med-info">
                    <span className="rx-med-title">{med.name}</span>
                    {med.dosage && (
                      <span className="rx-dosage-chip">{med.dosage}</span>
                    )}
                  </div>
                </div>

                {/* 2. Frequency */}
                <div className="rx-cell-freq">
                  <span className="rx-pill-badge">{med.frequency || 'As directed'}</span>
                </div>

                {/* 3. Duration */}
                <div className="rx-cell-dur">
                  <div className="rx-duration-text">
                    <Clock size={14} style={{ color: 'var(--text-secondary, #64748b)' }} />
                    <span>{med.duration || 'Full course'}</span>
                  </div>
                </div>

                {/* 4. Instructions */}
                <div className="rx-cell-inst">
                  <span>{med.instructions || 'Take as instructed by physician'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescription.additionalInstructions && (
        <div className="rx-additional-notes">
          <div className="rx-notes-header">
            <Info size={15} style={{ color: '#0284c7' }} />
            <span className="rx-notes-title">
              Doctor's General Advice & Instructions:
            </span>
          </div>
          <p className="rx-notes-body">
            {prescription.additionalInstructions}
          </p>
        </div>
      )}
    </div>
  );
};
