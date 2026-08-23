const { Resend } = require('resend');
const NotificationLog = require('../models/NotificationLog');
const config = require('../config/env');

let resendClient = null;

/**
 * Initialize or return singleton Resend SDK client instance
 */
const getResendClient = () => {
  if (!resendClient && config.RESEND_API_KEY) {
    resendClient = new Resend(config.RESEND_API_KEY);
  }
  return resendClient;
};

/**
 * Verify Resend SDK configuration at server startup without blocking
 */
const verifyTransporter = async () => {
  if (config.ENABLE_EMAIL_NOTIFICATIONS && config.RESEND_API_KEY) {
    console.log('[EmailService] Resend SDK initialized over HTTPS API (port 443).');
    return true;
  }
  console.log('[EmailService] Running in Development / Mock Mode (Emails logged to console)');
  return true;
};

/**
 * Core sendEmail function using official Resend Node.js SDK with NotificationLog persistence,
 * exponential backoff, idempotency keys, and non-blocking safety
 * @param {object} params - { to, subject, html, text, appointmentId, notificationType, payload, recipientName, idempotencyKey }
 * @returns {Promise<{ success: boolean, messageId?: string, emailId?: string, logId?: string, error?: string }>}
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  appointmentId = null,
  notificationType = 'GENERAL_NOTIFICATION',
  payload = {},
  recipientName = '',
  idempotencyKey = null,
  isRetry = false,
}) => {
  if (!to || (typeof to !== 'string' && !Array.isArray(to))) {
    console.warn('[EmailService] sendEmail skipped: No recipient email provided');
    return { success: false, error: 'Recipient email missing' };
  }

  const recipientList = Array.isArray(to) ? to : [to.trim().toLowerCase()];
  const recipientStr = recipientList.join(', ');

  const mailPayload = {
    from: config.EMAIL_FROM || 'HealthPulse <onboarding@resend.dev>',
    to: recipientList,
    subject: subject || 'HealthPulse Hospital Notification',
    html: html || `<p>${text || subject}</p>`,
    ...(text && { text }),
    ...(config.EMAIL_REPLY_TO && { replyTo: config.EMAIL_REPLY_TO }),
  };

  const effectiveIdempotencyKey =
    idempotencyKey || (appointmentId ? `${notificationType.toLowerCase()}-${appointmentId}` : undefined);

  // If email notifications are disabled or API key is missing, execute in Mock Mode
  if (!config.ENABLE_EMAIL_NOTIFICATIONS || !config.RESEND_API_KEY) {
    console.log(`[EmailService MOCK] [To: ${recipientStr}] [Subject: "${mailPayload.subject}"]`);
    const mockId = `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: recipientStr,
          recipientName: recipientName || payload.recipientName || '',
          notificationType,
          appointmentId,
          subject: mailPayload.subject,
          payload,
          status: 'sent',
          attempts: 1,
          sentAt: new Date(),
        });
      } catch (logErr) {
        console.warn('[EmailService] Warning writing mock NotificationLog:', logErr.message);
      }
    }

    return {
      success: true,
      mocked: true,
      messageId: mockId,
      emailId: mockId,
      logId: logEntry ? logEntry._id : null,
    };
  }

  // Real Resend API Send via HTTPS SDK
  try {
    const resend = getResendClient();
    const options = effectiveIdempotencyKey ? { idempotencyKey: effectiveIdempotencyKey } : undefined;

    const { data, error } = await resend.emails.send(mailPayload, options);

    if (error) {
      throw new Error(error.message || 'Failed to dispatch via Resend API');
    }

    const emailId = data.id || `resend-${Date.now()}`;
    console.log(`[EmailService] Email sent successfully via Resend API to ${recipientStr} (ID: ${emailId})`);

    // Write success to NotificationLog (only if not a retry cycle)
    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: recipientStr,
          recipientName: recipientName || payload.recipientName || '',
          notificationType,
          appointmentId,
          subject: mailPayload.subject,
          payload,
          status: 'sent',
          attempts: 1,
          sentAt: new Date(),
        });
      } catch (logErr) {
        console.warn('[EmailService] Warning writing NotificationLog:', logErr.message);
      }
    }

    return {
      success: true,
      messageId: emailId,
      emailId,
      logId: logEntry ? logEntry._id : null,
    };
  } catch (sendError) {
    console.error(`[EmailService] Failed to send email to ${recipientStr}: ${sendError.message}`);

    const attempts = 1;
    const isPermanent =
      sendError.message &&
      /testing emails|verify a domain|invalid|validation|403|422/i.test(sendError.message);

    const status = isPermanent ? 'dead' : 'failed';
    const backoffMinutes = Math.min(60, Math.pow(2, attempts));
    const nextRetryAt = isPermanent ? null : new Date(Date.now() + backoffMinutes * 60 * 1000);

    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: recipientStr,
          recipientName: recipientName || payload.recipientName || '',
          notificationType,
          appointmentId,
          subject: mailPayload.subject,
          payload,
          status,
          attempts,
          lastError: sendError.message,
          nextRetryAt,
        });
      } catch (logErr) {
        console.warn('[EmailService] Warning writing failure NotificationLog:', logErr.message);
      }
    }

    return {
      success: false,
      error: sendError.message,
      logId: logEntry ? logEntry._id : null,
    };
  }
};

/**
 * Background Retry Job: Retries failed notifications with exponential backoff
 * Marks notifications as 'dead' after MAX_ATTEMPTS (5) or on permanent failures
 * @param {number} maxBatch - Maximum logs to process per run (default: 20)
 * @returns {Promise<{ retried: number, succeeded: number, markedDead: number }>}
 */
const retryFailedNotifications = async (maxBatch = 20) => {
  const now = new Date();
  const MAX_ATTEMPTS = 5;

  try {
    const failedLogs = await NotificationLog.find({
      status: { $in: ['failed', 'FAILED', 'pending', 'PENDING'] },
      $or: [
        { nextRetryAt: { $lte: now } },
        { nextRetryAt: null }
      ],
      attempts: { $lt: MAX_ATTEMPTS },
    }).limit(maxBatch);

    if (!failedLogs.length) {
      return { retried: 0, succeeded: 0, markedDead: 0 };
    }

    console.log(`[EmailRetryWorker] Found ${failedLogs.length} failed notifications eligible for retry`);

    let succeeded = 0;
    let markedDead = 0;
    const emailTemplates = require('./emailTemplates');

    for (const log of failedLogs) {
      const currentAttempts = (log.attempts || 0) + 1;

      let rendered = null;
      if (log.payload && log.notificationType) {
        const templateFn = emailTemplates[log.notificationType] || emailTemplates.bookingConfirmation;
        if (typeof templateFn === 'function') {
          rendered = templateFn(log.payload);
        }
      }

      const retryResult = await sendEmail({
        to: log.recipientEmail,
        subject: rendered ? rendered.subject : log.subject,
        html: rendered ? rendered.html : `<p>${log.subject}</p>`,
        text: rendered ? rendered.text : log.subject,
        appointmentId: log.appointmentId,
        notificationType: log.notificationType,
        payload: log.payload,
        recipientName: log.recipientName,
        idempotencyKey: `retry-${currentAttempts}-${log._id}`,
        isRetry: true,
      });

      if (retryResult.success) {
        log.status = 'sent';
        log.attempts = currentAttempts;
        log.sentAt = new Date();
        log.lastError = '';
        log.nextRetryAt = null;
        await log.save();
        succeeded++;
        console.log(`[EmailRetryWorker] Retry succeeded for log ${log._id} -> ${log.recipientEmail}`);
      } else {
        log.attempts = currentAttempts;
        log.lastError = retryResult.error || 'Retry failed';

        const maxLimit = log.maxAttempts || MAX_ATTEMPTS;
        const isPermanent =
          retryResult.error &&
          /testing emails|verify a domain|invalid|validation|403|422/i.test(retryResult.error);

        if (currentAttempts >= maxLimit || isPermanent) {
          log.status = 'dead';
          log.nextRetryAt = null;
          markedDead++;
          console.warn(
            `[EmailRetryWorker] Notification ${log._id} reached max attempts or permanent error (${currentAttempts}/${maxLimit}). Marked as DEAD.`
          );
        } else {
          const backoffMinutes = Math.min(120, Math.pow(2, currentAttempts));
          log.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
        }

        await log.save();
      }
    }

    return {
      retried: failedLogs.length,
      succeeded,
      markedDead,
    };
  } catch (workerErr) {
    console.error('[EmailRetryWorker] Error executing retry job:', workerErr.message);
    return { retried: 0, succeeded: 0, markedDead: 0 };
  }
};

module.exports = {
  getResendClient,
  verifyTransporter,
  sendEmail,
  retryFailedNotifications,
};
