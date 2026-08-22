const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const NotificationLog = require('../models/NotificationLog');
const config = require('../config/env');

// --- Resend HTTP API client (primary — works from Render/cloud IPs via HTTPS) ---
let resendClient = null;

const getResendClient = () => {
  if (resendClient) return resendClient;
  if (config.RESEND_API_KEY) {
    resendClient = new Resend(config.RESEND_API_KEY);
    console.log('[EmailService] Resend HTTP API client initialized');
  }
  return resendClient;
};

// --- Nodemailer mock transporter (local dev fallback when RESEND_API_KEY is absent) ---
let mockTransporter = null;

const getMockTransporter = () => {
  if (mockTransporter) return mockTransporter;
  mockTransporter = {
    sendMail: async (mailOptions) => {
      console.log(
        `[EmailService MOCK] [To: ${mailOptions.to}] [Subject: "${mailOptions.subject}"]`
      );
      return {
        messageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        accepted: [mailOptions.to],
      };
    },
    verify: async () => true,
  };
  console.log('[EmailService] Running in Development / Mock Mode (Emails logged to console)');
  return mockTransporter;
};

// Kept for backward compat — returns mock in dev, null in prod (prod uses resendClient directly)
const getTransporter = () => {
  if (!config.RESEND_API_KEY) {
    return getMockTransporter();
  }
  return null; // prod path uses resendClient
};

// Initialize at module load
getResendClient() || getMockTransporter();

/**
 * Verify email delivery capability at server startup (never crashes the server)
 */
const verifyTransporter = async () => {
  if (!config.ENABLE_EMAIL_NOTIFICATIONS) {
    console.log('[EmailService] Email notifications disabled — skipping verification');
    return true;
  }

  if (config.RESEND_API_KEY) {
    // Resend: verify by pinging their API (lightweight domains list call)
    try {
      const client = getResendClient();
      await client.domains.list(); // Returns 200 if key is valid
      console.log('[EmailService] SMTP connection verified successfully with Gmail.');
      return true;
    } catch (err) {
      console.warn(`[EmailService] Resend API key verification warning: ${err.message}`);
      return false;
    }
  }

  // Dev mock — always passes
  console.log('[EmailService] Running in mock mode — verification skipped');
  return true;
};

/**
 * Core sendEmail function with NotificationLog persistence, exponential backoff, and non-blocking safety
 * @param {object} params - { to, subject, html, text, appointmentId, notificationType, payload, recipientName }
 * @returns {Promise<{ success: boolean, messageId?: string, logId?: string }>}
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
}) => {
  if (!to || typeof to !== 'string' || !to.trim()) {
    console.warn('[EmailService] sendEmail skipped: No recipient email provided');
    return { success: false, error: 'Recipient email missing' };
  }

  const recipient = to.trim().toLowerCase();
  const fromAddress = config.EMAIL_FROM || '"HealthPulse Hospital" <onboarding@resend.dev>';
  const emailSubject = subject || 'HealthPulse Hospital Notification';
  const emailHtml = html || `<p>${text || subject}</p>`;
  const emailText = text || subject;

  try {
    let messageId;

    if (config.RESEND_API_KEY) {
      // --- Primary: Resend HTTP API (works from Render — HTTPS, no SMTP port issues) ---
      const client = getResendClient();
      const { data, error } = await client.emails.send({
        from: fromAddress,
        to: recipient,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });

      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }

      messageId = data?.id || 'resend-ok';
    } else {
      // --- Fallback: Mock transporter (local dev) ---
      const mock = getMockTransporter();
      const info = await mock.sendMail({
        from: fromAddress, to: recipient,
        subject: emailSubject, html: emailHtml, text: emailText,
      });
      messageId = info.messageId;
    }

    console.log(`[EmailService] Email delivered to ${recipient} (ID: ${messageId})`);



    // Write success to NotificationLog
    let logEntry = null;
    try {
      logEntry = await NotificationLog.create({
        recipientEmail: recipient,
        recipientName: recipientName || payload.recipientName || '',
        notificationType,
        appointmentId,
        subject: mailOptions.subject,
        payload,
        status: 'sent',
        attempts: 1,
        sentAt: new Date(),
      });
    } catch (logErr) {
      console.warn('[EmailService] Warning writing NotificationLog:', logErr.message);
    }

    return {
      success: true,
      messageId,
      logId: logEntry ? logEntry._id : null,
    };
  } catch (sendError) {
    console.error(`[EmailService] Failed to send email to ${recipient}: ${sendError.message}`);

    // Compute exponential backoff for next retry (e.g. 2^1 = 2 minutes, 2^2 = 4 min, etc.)
    const attempts = 1;
    const backoffMinutes = Math.min(60, Math.pow(2, attempts));
    const nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

    let logEntry = null;
    try {
      logEntry = await NotificationLog.create({
        recipientEmail: recipient,
        recipientName: recipientName || payload.recipientName || '',
        notificationType,
        appointmentId,
        subject: emailSubject,
        payload,
        status: 'failed',
        attempts,
        lastError: sendError.message,
        nextRetryAt,
      });
    } catch (logErr) {
      console.warn('[EmailService] Warning writing failure NotificationLog:', logErr.message);
    }

    // Never throw - graceful failure ensures core booking transactions are never blocked
    return {
      success: false,
      error: sendError.message,
      logId: logEntry ? logEntry._id : null,
    };
  }
};

/**
 * Background Retry Job: Retries failed notifications with exponential backoff
 * Marks notifications as 'dead' after MAX_ATTEMPTS (5)
 * @param {number} maxBatch - Maximum logs to process per run (default: 20)
 * @returns {Promise<{ retried: number, succeeded: number, markedDead: number }>}
 */
const retryFailedNotifications = async (maxBatch = 20) => {
  const now = new Date();
  const MAX_ATTEMPTS = 5;

  try {
    const failedLogs = await NotificationLog.find({
      status: 'failed',
      nextRetryAt: { $lte: now },
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
      const currentAttempts = log.attempts + 1;

      // Check if template rendering can be reconstructed from payload
      let rendered = null;
      if (log.payload && log.notificationType) {
        const templateFn = emailTemplates[log.notificationType] || emailTemplates.bookingConfirmation;
        if (typeof templateFn === 'function') {
          rendered = templateFn(log.payload);
        }
      }

      const mailOptions = {
        from: config.EMAIL_FROM,
        to: log.recipientEmail,
        subject: rendered ? rendered.subject : log.subject,
        html: rendered ? rendered.html : `<p>${log.subject}</p>`,
        text: rendered ? rendered.text : log.subject,
      };

      try {
        const activeTransporter = getTransporter();
        const info = await activeTransporter.sendMail(mailOptions);
        log.status = 'sent';
        log.attempts = currentAttempts;
        log.sentAt = new Date();
        log.lastError = '';
        await log.save();
        succeeded++;
        console.log(`[EmailRetryWorker] Retry succeeded for log ${log._id} -> ${log.recipientEmail}`);
      } catch (retryError) {
        log.attempts = currentAttempts;
        log.lastError = retryError.message;

        if (currentAttempts >= MAX_ATTEMPTS) {
          log.status = 'dead';
          log.nextRetryAt = null;
          markedDead++;
          console.warn(`[EmailRetryWorker] Notification ${log._id} reached max attempts (${MAX_ATTEMPTS}). Marked as DEAD.`);
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
  getTransporter,
  verifyTransporter,
  sendEmail,
  retryFailedNotifications,
};
