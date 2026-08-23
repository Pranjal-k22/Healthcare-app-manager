const mongoose = require('c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/node_modules/mongoose');
const dotenv = require('c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/node_modules/dotenv');
dotenv.config({ path: 'c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/.env' });

const { sendEmail, retryFailedNotifications } = require('c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/services/emailService');
const emailTemplates = require('c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/services/emailTemplates');
const NotificationLog = require('c:/WEB DEVELOPMENT/healthcare-appointment-manager/server/models/NotificationLog');

const OWNER_EMAIL = 'pranjalkaran2004@gmail.com';

async function runE2eEmailTests() {
  console.log('================================================================');
  console.log('  STARTING CLEAN END-TO-END EMAIL NOTIFICATION SYSTEM VERIFICATION  ');
  console.log('================================================================\n');

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[E2E Test] Connected to MongoDB Atlas');

    const results = [];

    // 1. DOCTOR PROVISIONING EMAIL
    console.log('\n--- 1. Testing Doctor Provisioning Email (DOCTOR_PROVISIONED) ---');
    const provPayload = {
      doctorName: 'Dr. Adarsh Karan',
      email: OWNER_EMAIL,
      temporaryPassword: 'TempPassword123!',
      specialization: 'Neurology',
      provisionedByName: 'Super Admin',
    };
    const provTemplate = typeof emailTemplates.doctorProvisioned === 'function'
      ? emailTemplates.doctorProvisioned(provPayload)
      : {
          subject: 'Welcome to HealthPulse - Doctor Account Provisioned',
          html: `<p>Welcome Dr. Adarsh Karan. Your login email is ${OWNER_EMAIL}.</p>`,
          text: `Welcome Dr. Adarsh Karan. Your login email is ${OWNER_EMAIL}.`,
        };

    const provResult = await sendEmail({
      to: OWNER_EMAIL,
      subject: provTemplate.subject,
      html: provTemplate.html,
      text: provTemplate.text,
      notificationType: 'DOCTOR_PROVISIONED',
      payload: provPayload,
      recipientName: 'Dr. Adarsh Karan',
    });
    console.log('[E2E Test] Doctor Provisioned Result:', provResult);
    results.push({ type: 'DOCTOR_PROVISIONED', success: provResult.success, emailId: provResult.emailId });

    // 2. BOOKING CONFIRMATION EMAIL (PATIENT & DOCTOR)
    console.log('\n--- 2. Testing Booking Confirmation Emails (BOOKING_CONFIRMATION) ---');
    const bookingPayloadPatient = {
      recipientName: 'Pranjal Karan',
      recipientRole: 'PATIENT',
      doctorName: 'Dr. Tarpita',
      patientName: 'Pranjal Karan',
      specialisation: 'Cardiology',
      date: '2026-09-01',
      time: '10:00 AM - 10:30 AM',
      fee: 150,
      appointmentId: new mongoose.Types.ObjectId(),
    };
    const bookingTemplatePatient = typeof emailTemplates.bookingConfirmation === 'function'
      ? emailTemplates.bookingConfirmation(bookingPayloadPatient)
      : {
          subject: 'Appointment Confirmed - HealthPulse',
          html: `<p>Your appointment on 2026-09-01 has been confirmed.</p>`,
          text: `Your appointment on 2026-09-01 has been confirmed.`,
        };

    const bookingResultPatient = await sendEmail({
      to: OWNER_EMAIL,
      subject: bookingTemplatePatient.subject,
      html: bookingTemplatePatient.html,
      text: bookingTemplatePatient.text,
      appointmentId: bookingPayloadPatient.appointmentId,
      notificationType: 'BOOKING_CONFIRMATION',
      payload: bookingPayloadPatient,
      recipientName: 'Pranjal Karan',
    });
    console.log('[E2E Test] Patient Booking Confirmation Result:', bookingResultPatient);
    results.push({ type: 'BOOKING_CONFIRMATION_PATIENT', success: bookingResultPatient.success, emailId: bookingResultPatient.emailId });

    // 3. APPOINTMENT CANCELLATION EMAIL
    console.log('\n--- 3. Testing Appointment Cancellation Email (APPOINTMENT_CANCELLATION) ---');
    const cancelPayload = {
      recipientName: 'Pranjal Karan',
      recipientRole: 'PATIENT',
      doctorName: 'Dr. Tarpita',
      patientName: 'Pranjal Karan',
      date: '2026-09-01',
      time: '10:00 AM - 10:30 AM',
      reason: 'Schedule conflict',
      cancelledBy: 'Patient',
      appointmentId: bookingPayloadPatient.appointmentId,
    };
    const cancelTemplate = typeof emailTemplates.appointmentCancellation === 'function'
      ? emailTemplates.appointmentCancellation(cancelPayload)
      : {
          subject: 'Appointment Cancelled - HealthPulse',
          html: `<p>Your appointment on 2026-09-01 has been cancelled.</p>`,
          text: `Your appointment on 2026-09-01 has been cancelled.`,
        };

    const cancelResult = await sendEmail({
      to: OWNER_EMAIL,
      subject: cancelTemplate.subject,
      html: cancelTemplate.html,
      text: cancelTemplate.text,
      appointmentId: cancelPayload.appointmentId,
      notificationType: 'APPOINTMENT_CANCELLATION',
      payload: cancelPayload,
      recipientName: 'Pranjal Karan',
    });
    console.log('[E2E Test] Appointment Cancellation Result:', cancelResult);
    results.push({ type: 'APPOINTMENT_CANCELLATION', success: cancelResult.success, emailId: cancelResult.emailId });

    // 4. DOCTOR LEAVE NOTIFICATION EMAIL
    console.log('\n--- 4. Testing Doctor Leave Notification Email (DOCTOR_LEAVE) ---');
    const leavePayload = {
      recipientName: 'Pranjal Karan',
      doctorName: 'Dr. Tarpita',
      leaveDate: '2026-09-05',
      reason: 'Attending Medical Conference',
      affectedAppointmentsCount: 3,
    };
    const leaveTemplate = typeof emailTemplates.doctorLeaveNotice === 'function'
      ? emailTemplates.doctorLeaveNotice(leavePayload)
      : {
          subject: 'Notice: Doctor Schedule Update',
          html: `<p>Dr. Tarpita will be on leave on 2026-09-05.</p>`,
          text: `Dr. Tarpita will be on leave on 2026-09-05.`,
        };

    const leaveResult = await sendEmail({
      to: OWNER_EMAIL,
      subject: leaveTemplate.subject,
      html: leaveTemplate.html,
      text: leaveTemplate.text,
      notificationType: 'DOCTOR_LEAVE',
      payload: leavePayload,
      recipientName: 'Pranjal Karan',
    });
    console.log('[E2E Test] Doctor Leave Notice Result:', leaveResult);
    results.push({ type: 'DOCTOR_LEAVE', success: leaveResult.success, emailId: leaveResult.emailId });

    // 5. CHECK RETRY BACKLOG
    console.log('\n--- 5. Verifying Retry Backlog & Pending/Failed Count ---');
    const retryResult = await retryFailedNotifications(20);
    console.log('[E2E Test] Retry Worker Run Result:', retryResult);

    const failedCount = await NotificationLog.countDocuments({ status: { $in: ['failed', 'FAILED', 'pending', 'PENDING'] } });
    console.log(`[E2E Test] Total Pending/Failed Notifications in DB: ${failedCount}`);

    console.log('\n================================================================');
    console.log('  E2E SUMMARY RESULTS');
    console.log('================================================================');
    console.table(results);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[E2E Test] Exception:', err);
    process.exit(1);
  }
}

runE2eEmailTests();
