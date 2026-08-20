import React from 'react';
import { MedicineItem } from '../../types/clinical';
import { Pill, Plus, Trash2 } from 'lucide-react';

interface PrescriptionEditorProps {
  medicines: MedicineItem[];
  onChangeMedicines: (medicines: MedicineItem[]) => void;
  additionalInstructions: string;
  onChangeAdditionalInstructions: (instructions: string) => void;
  disabled?: boolean;
}

export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({
  medicines,
  onChangeMedicines,
  additionalInstructions,
  onChangeAdditionalInstructions,
  disabled = false,
}) => {
  const handleAddMedicine = () => {
    const newMed: MedicineItem = {
      name: '',
      dosage: '',
      frequency: 'Twice daily',
      duration: '5 days',
      instructions: 'Take with water after meals',
    };
    onChangeMedicines([...medicines, newMed]);
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    onChangeMedicines(updated);
  };

  const handleUpdateField = (
    index: number,
    field: keyof MedicineItem,
    value: string
  ) => {
    const updated = [...medicines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChangeMedicines(updated);
  };

  return (
    <div className="prescription-editor-container">
      <div className="prescription-editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Pill size={18} color="#10b981" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Prescribed Medications</h4>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleAddMedicine}
          disabled={disabled}
        >
          <Plus size={14} />
          <span>Add Medication</span>
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="empty-medicines-box">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No medications prescribed yet. Click <strong>"Add Medication"</strong> to add structured prescriptions.
          </p>
        </div>
      ) : (
        <div className="medicines-editor-list">
          {medicines.map((med, index) => (
            <div key={index} className="medicine-editor-row glass-card">
              <div className="medicine-row-header">
                <span className="medicine-num-badge">#{index + 1}</span>
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  style={{ padding: '0.25rem 0.5rem' }}
                  onClick={() => handleRemoveMedicine(index)}
                  disabled={disabled}
                  title="Remove medication"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="medicine-fields-grid">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-sublabel">Medicine Name *</label>
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="e.g. Amoxicillin, Paracetamol"
                    value={med.name}
                    onChange={(e) =>
                      handleUpdateField(index, 'name', e.target.value)
                    }
                    disabled={disabled}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-sublabel">Dosage *</label>
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="e.g. 500 mg, 10 ml"
                    value={med.dosage}
                    onChange={(e) =>
                      handleUpdateField(index, 'dosage', e.target.value)
                    }
                    disabled={disabled}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-sublabel">Frequency *</label>
                  <select
                    className="form-input form-input-sm"
                    value={med.frequency}
                    onChange={(e) =>
                      handleUpdateField(index, 'frequency', e.target.value)
                    }
                    disabled={disabled}
                  >
                    <option value="Once daily">Once daily (OD)</option>
                    <option value="Twice daily">Twice daily (BD)</option>
                    <option value="Thrice daily">Thrice daily (TDS)</option>
                    <option value="Every 6 hours">Every 6 hours (QID)</option>
                    <option value="Once at bedtime">Once at bedtime (HS)</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-sublabel">Duration *</label>
                  <input
                    type="text"
                    className="form-input form-input-sm"
                    placeholder="e.g. 5 days, 2 weeks"
                    value={med.duration}
                    onChange={(e) =>
                      handleUpdateField(index, 'duration', e.target.value)
                    }
                    disabled={disabled}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.65rem', marginBottom: 0 }}>
                <label className="form-sublabel">Special Instructions</label>
                <input
                  type="text"
                  className="form-input form-input-sm"
                  placeholder="e.g. Take with water after meals, avoid alcohol"
                  value={med.instructions}
                  onChange={(e) =>
                    handleUpdateField(index, 'instructions', e.target.value)
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-group" style={{ marginTop: '1.25rem' }}>
        <label className="form-label">General Advice & Dietary Instructions</label>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Additional notes for the patient (e.g. Drink plenty of fluids, rest for 3 days, avoid strenuous exercise)..."
          value={additionalInstructions}
          onChange={(e) => onChangeAdditionalInstructions(e.target.value)}
          disabled={disabled}
          maxLength={2000}
        />
      </div>
    </div>
  );
};
