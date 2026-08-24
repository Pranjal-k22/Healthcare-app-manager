import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyPrescriptions } from '../../services/clinicalApi';
import { MedicineItem } from '../../types/clinical';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Input from '../../components/ui/Input';
import {
  Pill,
  Search,
  Printer,
  FileText,
  X,
} from 'lucide-react';

interface PrescriptionItem {
  _id: string;
  doctorName: string;
  specialization: string;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  medicines: MedicineItem[];
  instructions: string;
}

export const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'>('ALL');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionItem | null>(null);

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setIsLoading(true);
        const apiData = await getMyPrescriptions();
        if (apiData) {
          const mapped: PrescriptionItem[] = apiData.map((p: any, idx) => ({
            _id: p._id || `RX-${2026}-${1000 + idx}`,
            doctorName: typeof p.doctorId === 'object' ? p.doctorId?.name : 'Dr. Attending Physician',
            specialization: typeof p.doctorId === 'object' && p.doctorId?.specialization ? p.doctorId.specialization : 'Specialist Consultation',
            date: p.createdAt ? p.createdAt.split('T')[0] : '2026-08-15',
            status: p.status ? p.status.toUpperCase() : (idx === 0 ? 'ACTIVE' : 'COMPLETED'),
            medicines: p.medicines || [],
            instructions: p.additionalInstructions || 'Take medications as directed by your physician.',
          }));
          setPrescriptions(mapped);
        }
      } catch (err) {
        console.warn('Failed to load patient prescriptions', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const docMatch = p.doctorName.toLowerCase().includes(q) || p.specialization.toLowerCase().includes(q);
      const medMatch = p.medicines.some((m) => m.name.toLowerCase().includes(q));
      if (!docMatch && !medMatch) return false;
    }
    return true;
  });

  const handlePrint = (rx: PrescriptionItem) => {
    setSelectedPrescription(rx);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="prescriptions-page-view">
        {/* Page Header */}
        <div className="dashboard-header-row" style={{ marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">Prescriptions</h1>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              View and manage your prescribed medications, dosages, and clinical instructions.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <Card noPadding style={{ marginBottom: '1.75rem' }}>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
              <Input
                id="rx-search-input"
                type="text"
                placeholder="Search medication or doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
                style={{ marginBottom: 0 }}
              />
            </div>

            {/* Segmented Status Filter Tabs */}
            <div className="segmented-tab-group" role="tablist">
              <button
                type="button"
                className={`segmented-tab-btn ${statusFilter === 'ALL' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
                role="tab"
                aria-selected={statusFilter === 'ALL'}
              >
                All
              </button>
              <button
                type="button"
                className={`segmented-tab-btn ${statusFilter === 'ACTIVE' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('ACTIVE')}
                role="tab"
                aria-selected={statusFilter === 'ACTIVE'}
              >
                Active
              </button>
              <button
                type="button"
                className={`segmented-tab-btn ${statusFilter === 'COMPLETED' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('COMPLETED')}
                role="tab"
                aria-selected={statusFilter === 'COMPLETED'}
              >
                Completed
              </button>
              <button
                type="button"
                className={`segmented-tab-btn ${statusFilter === 'EXPIRED' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('EXPIRED')}
                role="tab"
                aria-selected={statusFilter === 'EXPIRED'}
              >
                Expired
              </button>
            </div>
          </div>
        </Card>

        {/* Prescription List Cards */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div className="btn-spinner" style={{ width: '32px', height: '32px', borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <Card className="empty-state-card-ui">
            <div className="empty-state-icon-circle">
              <Pill size={28} />
            </div>
            <h3 className="empty-state-title">No Prescriptions Found</h3>
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No prescriptions matched your active search filters.'
                : 'You have no prescriptions on record. Prescriptions issued during doctor consultations will appear here.'}
            </p>
            {(searchTerm || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredPrescriptions.map((rx) => (
              <Card key={rx._id} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-alt)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(0, 98, 204, 0.08)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pill size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h3 className="card-title" style={{ margin: 0 }}>{rx.doctorName}</h3>
                        <span className="doctor-spec-chip">{rx.specialization}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span>Prescription ID: <strong>{rx._id}</strong></span>
                        <span>•</span>
                        <span>Date Issued: {rx.date}</span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={rx.status} size="sm" />
                </div>

                {/* Medication Items Compact Table */}
                <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Medication</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Dosage</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Frequency</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medicines.map((m, mIdx) => (
                        <tr key={mIdx} style={{ borderBottom: '1px solid var(--surface-alt)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{m.dosage}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{m.frequency}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Instructions */}
                {rx.instructions && (
                  <div style={{ backgroundColor: 'var(--surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    <strong>Physician Instructions:</strong> {rx.instructions}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(rx)}
                    leftIcon={<FileText size={14} />}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrint(rx)}
                    leftIcon={<Printer size={14} />}
                  >
                    Print Prescription
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Print Preview & Detail Modal */}
      {selectedPrescription && (
        <div className="print-modal-backdrop" onClick={() => setSelectedPrescription(null)}>
          <div className="print-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header print-hidden">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Print Preview - Prescription {selectedPrescription._id}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" size="sm" onClick={triggerBrowserPrint} leftIcon={<Printer size={14} />}>
                  Print Document
                </Button>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Area (Strips all UI chrome when printing) */}
            <div className="print-modal-body print-area">
              <div className="printable-document">
                {/* Document Header */}
                <div className="doc-header">
                  <div>
                    <div className="doc-brand-title">HealthPulse Hospital & Medical Center</div>
                    <div className="doc-brand-subtitle">Department of Clinical Medicine • Inpatient & Outpatient Care</div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>742 Evergreen Medical Parkway, Healthcare District • Tel: (555) 019-2834</div>
                  </div>
                  <div className="doc-type-badge">
                    <div className="doc-type-title">PRESCRIPTION</div>
                    <div className="doc-meta-text">Ref: <strong>{selectedPrescription._id}</strong></div>
                    <div className="doc-meta-text">Date: {selectedPrescription.date}</div>
                  </div>
                </div>

                {/* Patient & Doctor Information Grid */}
                <div className="doc-info-grid">
                  <div className="doc-info-block">
                    <h4>Patient Information</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Full Name:</span>
                      <span className="doc-info-val">{user?.name || 'Verified Patient'}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Patient ID:</span>
                      <span className="doc-info-val" style={{ fontFamily: 'monospace' }}>{user?._id || 'PAT-00928'}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Email:</span>
                      <span className="doc-info-val">{user?.email}</span>
                    </div>
                  </div>

                  <div className="doc-info-block">
                    <h4>Prescribing Practitioner</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Doctor Name:</span>
                      <span className="doc-info-val">{selectedPrescription.doctorName}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Department:</span>
                      <span className="doc-info-val">{selectedPrescription.specialization}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">License Ref:</span>
                      <span className="doc-info-val">MD-LIC-88392-CLINICAL</span>
                    </div>
                  </div>
                </div>

                {/* Medication Table with Clear Grid Lines for Print */}
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>Medication</th>
                      <th style={{ width: '15%' }}>Dosage</th>
                      <th style={{ width: '25%' }}>Frequency</th>
                      <th style={{ width: '15%' }}>Duration</th>
                      <th style={{ width: '20%' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines.map((med, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold' }}>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td>{med.frequency}</td>
                        <td>{med.duration}</td>
                        <td>{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Physician Notes */}
                {selectedPrescription.instructions && (
                  <div className="doc-notes-box">
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#0062CC' }}>Physician Dietary & Care Instructions:</div>
                    <div>{selectedPrescription.instructions}</div>
                  </div>
                )}

                {/* Footer & Signature */}
                <div className="doc-footer">
                  <div>
                    <div>Generated via HealthPulse Hospital Patient Portal on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '2px' }}>
                      Notice: This official electronic prescription is issued by an authorized physician. Do not alter dosage without consulting the prescriber.
                    </div>
                  </div>

                  <div className="doc-signature-line">
                    <div>Dr. Signature / Seal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
