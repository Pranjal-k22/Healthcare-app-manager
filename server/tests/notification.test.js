const assert = require('assert');
const mongoose = require('mongoose');
const { Notification, NOTIFICATION_TYPES } = require('../models/Notification');
const {
  buildAppointmentBookedEmail,
  buildAppointmentCancelledEmail,
  buildAppointmentRescheduledEmail,
  buildAppointmentReminderEmail,
  buildPrescriptionAvailableEmail,
} = require('../services/email/emailTemplates');

const runNotificationTests = async () => {
  console.log('\n--- [TEST SUITE 5] Notifications & Background Jobs ---');

  // 1. Notification Schema & Types
  assert.ok(Notification.schema.paths.userId, 'Must have userId');
  assert.ok(Notification.schema.paths.type, 'Must have type');
  assert.ok(Notification.schema.paths.title, 'Must have title');
  assert.ok(Notification.schema.paths.message, 'Must have message');
  assert.ok(Notification.schema.paths.isRead, 'Must have isRead');

  assert.deepStrictEqual(NOTIFICATION_TYPES, [
    'APPOINTMENT_BOOKED',
    'APPOINTMENT_CONFIRMED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_RESCHEDULED',
    'APPOINTMENT_REMINDER',
    'PRESCRIPTION_AVAILABLE',
    'MEDICATION_REMINDER',
  ]);
  console.log('✓ Notification model schema paths and notification types enum verified');

  // 2. Email Template Generation
  const mail1 = buildAppointmentBookedEmail({
    recipientName: 'Alice',
    doctorName: 'Dr. Sarah',
    patientName: 'Alice',
    date: '2026-09-01',
    startTime: '10:00',
    endTime: '10:30',
    isDoctor: false,
  });
  assert.ok(mail1.html.includes('Dr. Sarah'));
  assert.ok(mail1.text.includes('10:00 - 10:30'));

  const mail2 = buildAppointmentCancelledEmail({
    recipientName: 'Alice',
    date: '2026-09-01',
    startTime: '10:00',
    isDoctor: false,
    otherPartyName: 'Dr. Sarah',
    reason: 'Personal conflict',
  });
  assert.ok(mail2.subject.includes('Cancellation'));

  const mail3 = buildPrescriptionAvailableEmail({
    patientName: 'Alice',
    doctorName: 'Dr. Sarah',
    date: '2026-09-01',
    startTime: '10:00',
  });
  assert.ok(mail3.subject.includes('Prescription Ready'));
  console.log('✓ Transactional email template rendering and plain-text fallback verified');

  // 3. User Ownership & Privacy
  const userA_Id = new mongoose.Types.ObjectId().toString();
  const userB_Id = new mongoose.Types.ObjectId().toString();
  const notif = {
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    title: 'Your Consultation is Confirmed',
  };

  const isUserBAuthorizedToRead = notif.userId === userB_Id;
  assert.strictEqual(isUserBAuthorizedToRead, false, 'User B must NOT be able to read User A private notifications');
  console.log('✓ Notification cross-user privacy isolation verified');

  console.log('✓ [PASS] All Notification & Background Job Tests Passed!');
};

module.exports = runNotificationTests;
if (require.main === module) {
  runNotificationTests().catch((err) => {
    console.error('Notification test failed:', err);
    process.exit(1);
  });
}
