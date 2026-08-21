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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Pill size={16} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Prescribed Medications ({medicines.length})
          </h4>
        </div>

        <button
          type="button"
          onClick={handleAddMedicine}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '8px',
            border: '1.5px solid #0062cc',
            background: '#ffffff',
            color: '#0062cc',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={15} />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Empty State */}
      {medicines.length === 0 ? (
        <div
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <Pill size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
            No medications added to this prescription yet.
          </p>
          <button
            type="button"
            onClick={handleAddMedicine}
            disabled={disabled}
            style={{
              marginTop: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: 'none',
              background: '#0062cc',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={14} />
            <span>Add First Medication</span>
          </button>
        </div>
      ) : (
        /* Medicines List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {medicines.map((med, index) => (
            <div
              key={index}
              style={{
                padding: '1.15rem',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Row Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    color: '#0062cc',
                    letterSpacing: '0.04em',
                  }}
                >
                  MEDICATION #{index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(index)}
                  disabled={disabled}
                  title="Remove medication"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.55rem',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>

              {/* 4-Column Fields Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Drug / Medicine Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin, Metoprolol"
                    value={med.name}
                    onChange={(e) => handleUpdateField(index, 'name', e.target.value)}
                    disabled={disabled}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Dosage / Strength <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 10ml, 1 tablet"
                    value={med.dosage}
                    onChange={(e) => handleUpdateField(index, 'dosage', e.target.value)}
                    disabled={disabled}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Frequency <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={med.frequency}
                    onChange={(e) => handleUpdateField(index, 'frequency', e.target.value)}
                    disabled={disabled}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      background: '#ffffff',
                    }}
                  >
                    <option value="Once daily">Once daily (OD)</option>
                    <option value="Twice daily">Twice daily (BD)</option>
                    <option value="Thrice daily">Thrice daily (TDS)</option>
                    <option value="Every 6 hours">Every 6 hours (QID)</option>
                    <option value="Once at bedtime">Once at bedtime (HS)</option>
                    <option value="As needed (SOS)">As needed (SOS)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
                    Duration <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 days, 30 days, 2 weeks"
                    value={med.duration}
                    onChange={(e) => handleUpdateField(index, 'duration', e.target.value)}
                    disabled={disabled}
                    required
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Specific Patient Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with food, avoid driving, drink plenty of water"
                  value={med.instructions}
                  onChange={(e) => handleUpdateField(index, 'instructions', e.target.value)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem',
                    color: '#334155',
                    background: '#f8fafc',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* General Advice & Dietary Instructions Textarea */}
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ display: 'block', fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>
          General Advice & Dietary Instructions
        </label>
        <textarea
          rows={3}
          placeholder="Additional notes for the patient (e.g. Drink plenty of fluids, rest for 3 days, avoid strenuous exercise)..."
          value={additionalInstructions}
          onChange={(e) => onChangeAdditionalInstructions(e.target.value)}
          disabled={disabled}
          maxLength={2000}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.92rem',
            color: '#0f172a',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  );
};
