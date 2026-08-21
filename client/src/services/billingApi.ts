import apiClient from './apiClient';

export interface InvoiceLineItem {
  _id?: string;
  description: string;
  amount: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  appointmentId?: any;
  patientId: any;
  doctorId: any;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string | null;
  paidAt?: string | null;
  notes?: string | null;
}

export interface BillingSummary {
  totalBilled: number;
  outstandingBalance: number;
  lastPaymentDate: string | null;
}

/**
 * Get billing summary metrics
 */
export const getBillingSummary = async (): Promise<BillingSummary> => {
  const response = await apiClient.get<{ success: boolean; data: BillingSummary }>(
    '/patient/billing/summary'
  );
  return response.data.data;
};

/**
 * Get patient invoices
 */
export const getInvoices = async (params?: {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<{ invoices: Invoice[]; meta: any }> => {
  const response = await apiClient.get<{
    success: boolean;
    data: Invoice[];
    meta: any;
  }>('/patient/billing', { params });
  return {
    invoices: response.data.data,
    meta: response.data.meta,
  };
};

/**
 * Get single invoice detail
 */
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const response = await apiClient.get<{ success: boolean; data: Invoice }>(
    `/patient/billing/${id}`
  );
  return response.data.data;
};

/**
 * Pay invoice
 */
export const payInvoice = async (
  id: string,
  paymentMethod: string
): Promise<Invoice> => {
  const response = await apiClient.post<{ success: boolean; data: Invoice }>(
    `/patient/billing/${id}/pay`,
    { paymentMethod }
  );
  return response.data.data;
};
