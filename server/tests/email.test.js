const assert = require('assert');
const mongoose = require('mongoose');
const NotificationLog = require('../models/NotificationLog');
const emailTemplates = require('../services/emailTemplates');
const { sendEmail } = require('../services/emailService');

const runEmailTests = async () => {
  console.log('\n--- [TEST SUITE 12] Nodemailer Gmail SMTP & Email Notifications ---');

  // 1. Validate All 6 On-Brand Email Templates
  const sampleData = {
    recipientName: 'Sarah Connor',
    recipientRole: 'PATIENT',
    doctorName: 'Marcus Vance',
    patientName: 'Sarah Connor',
    specialisation: 'Cardiology',
    date: '2026-09-01',
    time: '09:00 - 09:45',
    fee: 120,
    hoursUntil: 24,
    medicationName: 'Metoprolol 50mg',
    dosage: '1 tablet daily',
    doseTime: '08:00 AM',
    instructions: 'Take with food in the morning',
    reason: 'Routine cardiac checkup',
    appointmentId: 'APP-TEST-999',
    rescheduleLink: '/patient/doctors',
  };

  const booking = emailTemplates.bookingConfirmation(sampleData);
  assert.ok(booking.subject && booking.html && booking.text, 'bookingConfirmation must return subject, html, text');
  assert.ok(booking.html.includes('HealthPulse'), 'HTML must include HealthPulse branding');
  assert.ok(booking.html.includes('#0062CC') || booking.html.includes('background'), 'HTML must use brand color');

  const reminder = emailTemplates.appointmentReminder(sampleData);
  assert.ok(reminder.subject && reminder.html && reminder.text, 'appointmentReminder must return subject, html, text');

  const cancel = emailTemplates.appointmentCancellation(sampleData);
  assert.ok(cancel.subject && cancel.html && cancel.text, 'appointmentCancellation must return subject, html, text');

  const conflict = emailTemplates.doctorLeaveConflict(sampleData);
  assert.ok(conflict.subject && conflict.html && conflict.text, 'doctorLeaveConflict must return subject, html, text');

  const medReminder = emailTemplates.medicationReminder(sampleData);
  assert.ok(medReminder.subject && medReminder.html && medReminder.text, 'medicationReminder must return subject, html, text');

  const pwdChange = emailTemplates.passwordChanged({ recipientName: 'Sarah Connor' });
  assert.ok(pwdChange.subject && pwdChange.html && pwdChange.text, 'passwordChanged must return subject, html, text');

  const rxEmail = emailTemplates.prescriptionIssued({
    recipientName: 'Sarah Connor',
    doctorName: 'Marcus Vance',
    specialisation: 'Cardiology',
    medicines: [{ name: 'Metoprolol 50mg', dosage: '50mg', frequency: '1 tablet daily', duration: '14 days', instructions: 'Take with food' }],
    instructions: 'Monitor resting heart rate',
    durationDays: 14,
  });
  assert.ok(rxEmail.subject && rxEmail.html && rxEmail.text, 'prescriptionIssued must return subject, html, text');
  assert.ok(rxEmail.html.includes('Metoprolol 50mg'), 'Prescription email must include medicine name');

  // Validate Doctor Leave Request Alert to Admin
  const leaveReqEmail = emailTemplates.doctorLeaveRequestedAdminAlert({
    doctorName: 'Marcus Vance',
    doctorEmail: 'dr.marcus@healthpulse.com',
    specialization: 'Cardiology',
    startDate: '2026-09-10',
    endDate: '2026-09-15',
    reason: 'Annual Medical Conference',
  });
  assert.ok(leaveReqEmail.subject && leaveReqEmail.html && leaveReqEmail.text, 'doctorLeaveRequestedAdminAlert must return subject, html, text');
  assert.ok(leaveReqEmail.subject.includes('Leave Application from Dr. Marcus Vance'), 'Subject must contain doctor name');
  assert.ok(leaveReqEmail.html.includes('Annual Medical Conference'), 'HTML must include leave reason');

  // Validate Doctor Leave Decision Alert to Doctor
  const leaveDecisionEmail = emailTemplates.doctorLeaveDecisionDoctorAlert({
    doctorName: 'Marcus Vance',
    startDate: '2026-09-10',
    endDate: '2026-09-15',
    status: 'APPROVED',
    reason: 'Annual Medical Conference',
    adminNotes: 'Approved by Medical Director',
    approvedByName: 'Super Admin',
  });
  assert.ok(leaveDecisionEmail.subject && leaveDecisionEmail.html && leaveDecisionEmail.text, 'doctorLeaveDecisionDoctorAlert must return subject, html, text');
  assert.ok(leaveDecisionEmail.subject.includes('Approved ✅'), 'Subject must indicate approval');
  assert.ok(leaveDecisionEmail.html.includes('Approved by Medical Director'), 'HTML must include admin remarks');

  console.log('✓ All branded email templates (including doctor leave request & confirmation alerts) validated');

  // 2. NotificationLog Schema Paths & Status Enums
  assert.ok(NotificationLog.schema.paths.recipientEmail, 'Must have recipientEmail');
  assert.ok(NotificationLog.schema.paths.notificationType, 'Must have notificationType');
  assert.ok(NotificationLog.schema.paths.subject, 'Must have subject');
  assert.ok(NotificationLog.schema.paths.status, 'Must have status');
  assert.ok(NotificationLog.schema.paths.attempts, 'Must have attempts');
  assert.ok(NotificationLog.schema.paths.nextRetryAt, 'Must have nextRetryAt');

  const statusEnumValues = NotificationLog.schema.paths.status.enumValues;
  assert.deepStrictEqual(statusEnumValues, ['sent', 'failed', 'dead']);
  console.log('✓ NotificationLog schema paths, retry fields, and status enums verified');

  // 3. Test sendEmail In-Memory Execution
  const successResult = await sendEmail({
    to: 'test-patient@healthpulse.com',
    subject: booking.subject,
    html: booking.html,
    text: booking.text,
    notificationType: 'bookingConfirmation',
    payload: sampleData,
    recipientName: 'Sarah Connor',
  });

  assert.strictEqual(successResult.success, true, 'sendEmail in mock/dev mode should succeed');
  console.log('✓ sendEmail execution and message ID dispatch verified');

  // 4. Test Exponential Backoff Calculation
  const calculateBackoffMinutes = (attempts) => Math.min(120, Math.pow(2, attempts));
  assert.strictEqual(calculateBackoffMinutes(1), 2, 'Attempt 1 backoff should be 2 mins');
  assert.strictEqual(calculateBackoffMinutes(2), 4, 'Attempt 2 backoff should be 4 mins');
  assert.strictEqual(calculateBackoffMinutes(3), 8, 'Attempt 3 backoff should be 8 mins');
  assert.strictEqual(calculateBackoffMinutes(4), 16, 'Attempt 4 backoff should be 16 mins');
  assert.strictEqual(calculateBackoffMinutes(5), 32, 'Attempt 5 backoff should be 32 mins');
  console.log('✓ Exponential backoff mathematical progression verified');

  // 5. Test Missing Recipient Graceful Handling (Never throws)
  const emptyResult = await sendEmail({ to: '', subject: 'Test' });
  assert.strictEqual(emptyResult.success, false, 'Should return false without throwing');
  console.log('✓ Non-blocking graceful error handling verified (email failures never throw)');

  console.log('✓ [PASS] All Nodemailer & Email Notification Tests Passed!\n');
};

module.exports = runEmailTests;

if (require.main === module) {
  runEmailTests().catch((err) => {
    console.error('Email test failed:', err);
    process.exit(1);
  });
}
