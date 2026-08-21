import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/ui/DashboardLayout';
import Button from '../../components/ui/Button';
import SummaryStatCard from '../../components/ui/SummaryStatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DataTable, { Column } from '../../components/ui/DataTable';
import { useToast } from '../../components/ui/Toast';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  doctorName: string;
  serviceDescription: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentMethod?: string;
  paidAt?: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0091',
    date: '2026-08-14',
    dueDate: '2026-08-28',
    doctorName: 'Dr. Sarah Jenkins',
    serviceDescription: 'Cardiology Specialist Consultation & ECG Review',
    amount: 180.0,
    status: 'PENDING',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0084',
    date: '2026-07-22',
    dueDate: '2026-08-05',
    doctorName: 'Dr. Marcus Vance',
    serviceDescription: 'Neurology Consultation & Migraine Assessment',
    amount: 150.0,
    status: 'PAID',
    paymentMethod: 'Visa •••• 4242',
    paidAt: '2026-07-22',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-0062',
    date: '2026-06-10',
    dueDate: '2026-06-24',
    doctorName: 'Dr. Sarah Jenkins',
    serviceDescription: 'Follow-up Consultation & Routine Bloodwork Order',
    amount: 110.0,
    status: 'PAID',
    paymentMethod: 'Mastercard •••• 8819',
    paidAt: '2026-06-10',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-0033',
    date: '2026-05-02',
    dueDate: '2026-05-16',
    doctorName: 'Dr. Marcus Vance',
    serviceDescription: 'Initial Comprehensive Health Screening',
    amount: 100.0,
    status: 'PAID',
    paymentMethod: 'Visa •••• 4242',
    paidAt: '2026-05-02',
  },
];

export const PatientBilling: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // Compute Metrics
  const totalBilled = invoices.reduce((sum, item) => sum + item.amount, 0);
  const outstandingBalance = invoices
    .filter((item) => item.status === 'PENDING' || item.status === 'OVERDUE')
    .reduce((sum, item) => sum + item.amount, 0);
  const lastPayment = invoices.find((item) => item.status === 'PAID')?.paidAt || 'Aug 14, 2026';

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true;
    return inv.status === statusFilter;
  });

  const handlePayNow = (inv: InvoiceItem) => {
    setIsPaying(true);
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((item) =>
          item.id === inv.id
            ? { ...item, status: 'PAID', paymentMethod: 'Card Online (Processed)', paidAt: new Date().toISOString().split('T')[0] }
            : item
        )
      );
      setIsPaying(false);
      success(`Invoice ${inv.invoiceNumber} paid successfully ($${inv.amount.toFixed(2)} USD).`, 'Payment Settled');
      if (selectedInvoice?.id === inv.id) {
        setSelectedInvoice((current) =>
          current ? { ...current, status: 'PAID', paymentMethod: 'Card Online (Processed)', paidAt: new Date().toISOString().split('T')[0] } : null
        );
      }
    }, 800);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (item) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
          {item.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Service Date',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{item.date}</span>
        </div>
      ),
    },
    {
      key: 'serviceDescription',
      header: 'Practitioner / Service',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.doctorName}</div>
          <div className="helper-text">{item.serviceDescription}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
          ${item.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <StatusBadge
          status={item.status === 'PAID' ? 'ACTIVE' : item.status === 'PENDING' ? 'PENDING' : 'CANCELLED'}
          label={item.status}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      searchable: false,
      align: 'right',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {item.status !== 'PAID' && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isPaying}
              onClick={() => handlePayNow(item)}
            >
              Pay Now
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedInvoice(item)}
            leftIcon={<Printer size={13} />}
          >
            Print
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="billing-page-view">
        {/* Page Header */}
        <div className="dashboard-header-row" style={{ marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">Billing & Payments</h1>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Review hospital service invoices, payment receipts, and outstanding account balances.
            </p>
          </div>
        </div>

        {/* Top Summary Stat Row */}
        <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
          <SummaryStatCard
            label="Total Billed"
            value={`$${totalBilled.toFixed(2)}`}
            icon={<CreditCard size={22} />}
            iconBgColor="rgba(0, 98, 204, 0.08)"
            iconColor="var(--primary)"
            subtext="All medical care on record"
          />
          <SummaryStatCard
            label="Outstanding Balance"
            value={`$${outstandingBalance.toFixed(2)}`}
            icon={<Clock size={22} />}
            iconBgColor={outstandingBalance > 0 ? 'var(--warning-bg)' : 'var(--success-bg)'}
            iconColor={outstandingBalance > 0 ? 'var(--warning)' : 'var(--success)'}
            subtext={outstandingBalance > 0 ? 'Payment due' : 'All accounts settled'}
          />
          <SummaryStatCard
            label="Last Payment Settled"
            value={lastPayment}
            icon={<CheckCircle2 size={22} />}
            iconBgColor="var(--success-bg)"
            iconColor="var(--success)"
            subtext="Electronic receipt verified"
          />
        </div>

        {/* Filter Segmented Control & Search */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="segmented-tab-group" role="tablist">
            <button
              type="button"
              className={`segmented-tab-btn ${statusFilter === 'ALL' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
              role="tab"
              aria-selected={statusFilter === 'ALL'}
            >
              All Invoices
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${statusFilter === 'PENDING' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('PENDING')}
              role="tab"
              aria-selected={statusFilter === 'PENDING'}
            >
              Pending
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${statusFilter === 'PAID' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('PAID')}
              role="tab"
              aria-selected={statusFilter === 'PAID'}
            >
              Paid
            </button>
            <button
              type="button"
              className={`segmented-tab-btn ${statusFilter === 'OVERDUE' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('OVERDUE')}
              role="tab"
              aria-selected={statusFilter === 'OVERDUE'}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Invoices DataTable */}
        <DataTable
          title="Hospital Service Invoices"
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search invoice #, doctor, or service..."
          exportFileName="hospital-billing-invoices"
          mobileCardRender={(item) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                  {item.invoiceNumber}
                </span>
                <StatusBadge
                  status={item.status === 'PAID' ? 'ACTIVE' : item.status === 'PENDING' ? 'PENDING' : 'CANCELLED'}
                  label={item.status}
                  size="sm"
                />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.doctorName}</div>
              <div className="helper-text">{item.serviceDescription}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span className="helper-text">Service Date: {item.date}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ${item.amount.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                {item.status !== 'PAID' && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    isLoading={isPaying}
                    onClick={() => handlePayNow(item)}
                  >
                    Pay Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setSelectedInvoice(item)}
                  leftIcon={<Printer size={13} />}
                >
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      {/* Invoice Detail / Print Preview Modal */}
      {selectedInvoice && (
        <div className="print-modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="print-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header print-hidden">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Invoice Receipt - {selectedInvoice.invoiceNumber}</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedInvoice.status !== 'PAID' && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isPaying}
                    onClick={() => handlePayNow(selectedInvoice)}
                  >
                    Pay ${selectedInvoice.amount.toFixed(2)}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={triggerBrowserPrint} leftIcon={<Printer size={14} />}>
                  Print Invoice
                </Button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Body (.print-area) */}
            <div className="print-modal-body print-area">
              <div className="printable-document">
                {/* Document Header */}
                <div className="doc-header">
                  <div>
                    <div className="doc-brand-title">HealthPulse Hospital & Medical Center</div>
                    <div className="doc-brand-subtitle">Patient Billing & Accounting Services</div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>Tax ID: 94-8839201 • billing@healthpulse.com • (555) 019-2835</div>
                  </div>
                  <div className="doc-type-badge">
                    <div className="doc-type-title">OFFICIAL INVOICE</div>
                    <div className="doc-meta-text">Invoice #: <strong>{selectedInvoice.invoiceNumber}</strong></div>
                    <div className="doc-meta-text">Issue Date: {selectedInvoice.date}</div>
                    <div className="doc-meta-text">Due Date: {selectedInvoice.dueDate}</div>
                  </div>
                </div>

                {/* Billed-To Grid */}
                <div className="doc-info-grid">
                  <div className="doc-info-block">
                    <h4>Billed To (Patient)</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Name:</span>
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
                    <h4>Provider / Billing Status</h4>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Practitioner:</span>
                      <span className="doc-info-val">{selectedInvoice.doctorName}</span>
                    </div>
                    <div className="doc-info-row">
                      <span className="doc-info-label">Payment Status:</span>
                      <span className="doc-info-val" style={{ color: selectedInvoice.status === 'PAID' ? '#155724' : '#856404' }}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                    {selectedInvoice.paidAt && (
                      <div className="doc-info-row">
                        <span className="doc-info-label">Settled On:</span>
                        <span className="doc-info-val">{selectedInvoice.paidAt} ({selectedInvoice.paymentMethod})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Line Item Table */}
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th style={{ width: '55%' }}>Service Description</th>
                      <th style={{ width: '25%' }}>Service Date</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>{selectedInvoice.serviceDescription}</td>
                      <td>{selectedInvoice.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals Table */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                  <table className="doc-table-totals" style={{ maxWidth: '320px' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#6c757d' }}>Subtotal:</td>
                        <td style={{ fontWeight: 600 }}>${selectedInvoice.amount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#6c757d' }}>Hospital Facility Tax:</td>
                        <td style={{ fontWeight: 600 }}>$0.00</td>
                      </tr>
                      <tr className="grand-total">
                        <td>Total Amount Due:</td>
                        <td>${selectedInvoice.amount.toFixed(2)} USD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="doc-footer">
                  <div>
                    <div>Generated via HealthPulse Patient Portal on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: '2px' }}>
                      For billing inquiries or insurance claim receipts, contact billing@healthpulse.com
                    </div>
                  </div>

                  <div className="doc-signature-line">
                    <div>Authorized Billing Agent</div>
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

export default PatientBilling;
