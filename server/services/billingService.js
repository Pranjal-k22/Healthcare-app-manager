const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

/**
 * Generate a unique sequential invoice number
 * @returns {Promise<string>}
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments();
  const sequence = String(count + 1).padStart(5, '0');
  return `INV-${year}-${sequence}`;
};

/**
 * Automatically create an invoice when an appointment is completed
 * @param {string} appointmentId
 * @param {string} doctorId
 * @param {string} patientId
 * @param {number} [customFee]
 * @param {Array} [customLineItems]
 * @returns {Promise<object>}
 */
const createInvoiceForAppointment = async (
  appointmentId,
  doctorId,
  patientId,
  customFee,
  customLineItems
) => {
  // Check if invoice already exists for this appointment
  const existingInvoice = await Invoice.findOne({ appointmentId });
  if (existingInvoice) {
    return existingInvoice;
  }

  let consultationFee = customFee;
  if (!consultationFee) {
    const doctorProfile = await DoctorProfile.findOne({ doctorId });
    consultationFee = doctorProfile?.consultationFee || 75.0;
  }

  const lineItems = customLineItems || [
    {
      description: 'Specialist Medical Consultation & Clinical Evaluation',
      amount: Number(consultationFee),
    },
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const dueDays = parseInt(process.env.INVOICE_DUE_DAYS || '14', 10);
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = new Invoice({
    invoiceNumber,
    appointmentId,
    patientId,
    doctorId,
    issueDate,
    dueDate,
    lineItems,
    subtotal,
    tax,
    discount,
    total,
    status: 'pending',
  });

  await invoice.save();
  return invoice;
};

/**
 * Get billing summary metrics for patient
 * @param {string} patientId
 * @returns {Promise<{ totalBilled: number, outstandingBalance: number, lastPaymentDate: string | null }>}
 */
const getPatientBillingSummary = async (patientId) => {
  const patientObjId = new mongoose.Types.ObjectId(patientId);

  const invoices = await Invoice.find({ patientId: patientObjId }).sort({ paidAt: -1, createdAt: -1 });

  let totalBilled = 0;
  let outstandingBalance = 0;
  let lastPaymentDate = null;

  for (const inv of invoices) {
    totalBilled += inv.total || 0;
    if (inv.status === 'pending' || inv.status === 'overdue') {
      outstandingBalance += inv.total || 0;
    }
    if (inv.status === 'paid' && inv.paidAt && !lastPaymentDate) {
      lastPaymentDate = inv.paidAt.toISOString().split('T')[0];
    }
  }

  return {
    totalBilled,
    outstandingBalance,
    lastPaymentDate,
  };
};

/**
 * Get paginated invoices for a patient with status and date filtering
 * @param {string} patientId
 * @param {object} query - { status, from, to, page, limit }
 * @returns {Promise<{ invoices: Array, total: number, page: number, totalPages: number }>}
 */
const getPatientInvoices = async (patientId, query = {}) => {
  const { status, from, to, page = 1, limit = 20 } = query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (status && ['pending', 'paid', 'overdue'].includes(status.toLowerCase())) {
    filter.status = status.toLowerCase();
  }

  if (from || to) {
    filter.issueDate = {};
    if (from) filter.issueDate.$gte = new Date(from);
    if (to) filter.issueDate.$lte = new Date(to);
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('doctorId', 'name email')
      .populate('appointmentId', 'date startTime endTime status reason')
      .sort({ issueDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Invoice.countDocuments(filter),
  ]);

  return {
    invoices,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

/**
 * Get single invoice detail by ID (scoped strictly to patient)
 * @param {string} patientId
 * @param {string} invoiceId
 * @returns {Promise<object>}
 */
const getPatientInvoiceById = async (patientId, invoiceId) => {
  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    patientId,
  })
    .populate('doctorId', 'name email')
    .populate('patientId', 'name email phone address')
    .populate('appointmentId', 'date startTime endTime');

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }

  return invoice;
};

/**
 * Pay an invoice
 * @param {string} patientId
 * @param {string} invoiceId
 * @param {string} paymentMethod
 * @returns {Promise<object>}
 */
const payInvoice = async (patientId, invoiceId, paymentMethod) => {
  const invoice = await getPatientInvoiceById(patientId, invoiceId);

  if (invoice.status === 'paid') {
    const error = new Error('Invoice has already been settled');
    error.statusCode = 400;
    throw error;
  }

  invoice.status = 'paid';
  invoice.paymentMethod = paymentMethod.trim();
  invoice.paidAt = new Date();

  await invoice.save();
  return invoice;
};

/**
 * Scheduled Daily Job: Persist 'overdue' status on pending invoices whose due date has passed
 * @returns {Promise<number>} Number of updated invoices
 */
const markOverdueInvoices = async () => {
  const now = new Date();
  const result = await Invoice.updateMany(
    {
      status: 'pending',
      dueDate: { $lt: now },
    },
    {
      $set: { status: 'overdue' },
    }
  );

  return result.modifiedCount || 0;
};

module.exports = {
  createInvoiceForAppointment,
  getPatientBillingSummary,
  getPatientInvoices,
  getPatientInvoiceById,
  payInvoice,
  markOverdueInvoices,
};
