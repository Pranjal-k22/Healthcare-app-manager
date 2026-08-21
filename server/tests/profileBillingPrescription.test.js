const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Prescription = require('../models/Prescription');
const {
  validateProfileUpdateInput,
  validateChangePasswordInput,
} = require('../validators/profileValidator');
const { validatePaymentInput } = require('../validators/billingValidator');
const {
  createInvoiceForAppointment,
  getPatientBillingSummary,
  payInvoice,
  markOverdueInvoices,
} = require('../services/billingService');
const {
  updatePrescriptionStatuses,
} = require('../services/prescriptionService');

const runProfileBillingTests = async () => {
  console.log('\n--- [TEST SUITE 11] Profile, Billing & Prescriptions Backend Subsystems ---');

  // 1. Profile Validation Tests
  const validProfile = validateProfileUpdateInput({
    name: 'Jane Doe',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1992-05-18',
    gender: 'Female',
    address: { line1: '123 Main St', city: 'Springfield', state: 'IL', postalCode: '62701' },
    emergencyContact: { name: 'Bob Doe', relationship: 'Spouse', phone: '+1 555 987-6543' },
  });
  assert.strictEqual(validProfile.valid, true, 'Valid profile should pass validation');

  // Protect immutable fields (email, role)
  const invalidEmailUpdate = validateProfileUpdateInput({ email: 'hacker@malicious.com' });
  assert.strictEqual(invalidEmailUpdate.valid, false, 'Email update should be blocked');

  const invalidRoleUpdate = validateProfileUpdateInput({ role: 'ADMIN' });
  assert.strictEqual(invalidRoleUpdate.valid, false, 'Role escalation should be blocked');

  // Password validation
  const validPwd = validateChangePasswordInput({ currentPassword: 'OldPassword123!', newPassword: 'NewPassword123!' });
  assert.strictEqual(validPwd.valid, true, 'Valid password change should pass');

  const shortPwd = validateChangePasswordInput({ currentPassword: 'OldPassword123!', newPassword: '123' });
  assert.strictEqual(shortPwd.valid, false, 'Short new password should fail');

  const samePwd = validateChangePasswordInput({ currentPassword: 'SamePassword123!', newPassword: 'SamePassword123!' });
  assert.strictEqual(samePwd.valid, false, 'Identical new password should fail');

  console.log('✓ Profile validation rules and immutable field protection verified');

  // 2. Billing & Payment Validation Tests
  const validPayment = validatePaymentInput({ paymentMethod: 'Visa •••• 4242' });
  assert.strictEqual(validPayment.valid, true, 'Valid payment method should pass');

  const emptyPayment = validatePaymentInput({ paymentMethod: '' });
  assert.strictEqual(emptyPayment.valid, false, 'Empty payment method should fail');

  console.log('✓ Billing payment payload validation verified');

  // 3. Invoice Schema & Billing Calculations
  const mockPatientId = new mongoose.Types.ObjectId();
  const mockDoctorId = new mongoose.Types.ObjectId();
  const mockAppointmentId = new mongoose.Types.ObjectId();

  const invoice = new Invoice({
    invoiceNumber: 'INV-2026-TEST01',
    appointmentId: mockAppointmentId,
    patientId: mockPatientId,
    doctorId: mockDoctorId,
    dueDate: new Date(Date.now() + 14 * 86400000),
    lineItems: [{ description: 'Cardiology Consultation', amount: 150 }],
    subtotal: 150,
    tax: 0,
    discount: 0,
    total: 150,
    status: 'pending',
  });

  assert.strictEqual(invoice.total, 150);
  assert.strictEqual(invoice.status, 'pending');
  assert.strictEqual(invoice.lineItems.length, 1);

  console.log('✓ Invoice schema, line items, and total amounts verified');

  // 4. Prescription Schema & Status
  const prescription = new Prescription({
    appointmentId: mockAppointmentId,
    patientId: mockPatientId,
    doctorId: mockDoctorId,
    status: 'active',
    durationDays: 10,
    medicines: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '10 days',
        instructions: 'Take after meals',
      },
    ],
  });

  assert.strictEqual(prescription.status, 'active');
  assert.strictEqual(prescription.durationDays, 10);
  assert.strictEqual(prescription.medicines.length, 1);

  console.log('✓ Prescription model with durationDays and status field verified');

  console.log('✓ [PASS] All Profile, Billing & Prescription Backend Tests Passed!\n');
};

module.exports = { runProfileBillingTests };

if (require.main === module) {
  runProfileBillingTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
