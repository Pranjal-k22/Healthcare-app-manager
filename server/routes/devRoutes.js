const express = require('express');
const { sendEmail } = require('../services/emailService');
const emailTemplates = require('../services/emailTemplates');
const config = require('../config/env');

const router = express.Router();

// Development-only guard middleware
const devOnlyGuard = (req, res, next) => {
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Dev endpoints are disabled in production mode.',
    });
  }
  next();
};

router.use(devOnlyGuard);

/**
 * POST /api/dev/test-email
 * Dev-only endpoint to verify Gmail SMTP delivery independently
 */
router.post('/test-email', async (req, res, next) => {
  try {
    const { to, template = 'bookingConfirmation' } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email "to" is required in request body.',
      });
    }

    const samplePayload = {
      recipientName: 'Test Recipient',
      recipientRole: 'PATIENT',
      doctorName: 'Marcus Vance',
      patientName: 'John Doe',
      specialisation: 'Cardiology',
      date: '2026-08-25',
      time: '10:00 AM - 10:45 AM',
      fee: 150,
      hoursUntil: 24,
      medicationName: 'Amoxicillin 500mg',
      dosage: '1 tablet twice daily',
      doseTime: '08:00 AM',
      reason: 'Routine Annual Health Checkup',
      appointmentId: 'SAMPLE-APP-12345',
    };

    const templateFn = emailTemplates[template] || emailTemplates.bookingConfirmation;
    const rendered = templateFn(samplePayload);

    const result = await sendEmail({
      to,
      ...rendered,
      notificationType: template,
      payload: samplePayload,
      recipientName: 'Test Recipient',
    });

    res.status(200).json({
      success: result.success,
      message: result.success
        ? `Test email (${template}) successfully dispatched to ${to}`
        : `Test email failed to send: ${result.error}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
