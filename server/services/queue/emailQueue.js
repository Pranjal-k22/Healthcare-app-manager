const NotificationLog = require('../../models/NotificationLog');
const { sendEmail } = require('../emailService');
const emailTemplates = require('../emailTemplates');
const config = require('../../config/env');

/**
 * Process a notification payload with idempotency check, template rendering, and error isolation
 */
const processNotificationJob = async (payload) => {
  const {
    to,
    recipientName = '',
    templateName,
    templateData = {},
    appointmentId = null,
    notificationType,
  } = payload;

  if (!to) {
    console.warn('[EmailWorker] Skipped: No recipient email');
    return { skipped: true, reason: 'No recipient email' };
  }

  const normalizedTo = to.trim().toLowerCase();
  const effectiveType = notificationType || templateName || 'GENERAL_NOTIFICATION';

  // 1. Idempotency Check: Prevent duplicate sends for same appointment + type + recipient
  if (appointmentId && effectiveType) {
    const existingSuccess = await NotificationLog.findOne({
      appointmentId,
      notificationType: effectiveType,
      recipientEmail: normalizedTo,
      status: 'sent',
    });

    if (existingSuccess) {
      console.log(
        `[EmailWorker] Idempotency guard: Email already sent to ${normalizedTo} for ${effectiveType} (${appointmentId})`
      );
      return { skipped: true, reason: 'Already sent' };
    }
  }

  // 2. Render Template
  const templateFn = emailTemplates[templateName] || emailTemplates.bookingConfirmation;
  const rendered = typeof templateFn === 'function' ? templateFn(templateData) : {
    subject: templateData.subject || 'HealthPulse Hospital Notification',
    html: templateData.html || `<p>${templateData.text || 'Notification'}</p>`,
    text: templateData.text || 'Notification',
  };

  // 3. Send Email via central EmailService
  console.log(`[EmailWorker] Dispatching ${effectiveType} to ${normalizedTo}`);
  const result = await sendEmail({
    to: normalizedTo,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    appointmentId,
    notificationType: effectiveType,
    payload: templateData,
    recipientName,
  });

  return result;
};

/**
 * Public enqueue function used by appointment, leave, and reminder controllers
 * Dispatches asynchronously via Node.js setImmediate (Never blocks HTTP response)
 * @param {object} jobData - { to, recipientName, templateName, templateData, appointmentId, notificationType }
 */
const queueEmailNotification = async (jobData) => {
  try {
    setImmediate(async () => {
      try {
        await processNotificationJob(jobData);
      } catch (err) {
        console.error(`[EmailQueue] Background worker error: ${err.message}`);
      }
    });
    console.log(`[EmailQueue] Notification scheduled asynchronously: ${jobData.notificationType || 'EMAIL'} -> ${jobData.to}`);
    return { queued: true };
  } catch (queueErr) {
    console.error(`[EmailQueue] Warning creating queue job: ${queueErr.message}`);
    return { queued: false, error: queueErr.message };
  }
};

module.exports = {
  queueEmailNotification,
  processNotificationJob,
};
