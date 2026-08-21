const nodemailer = require('nodemailer');
const NotificationLog = require('../models/NotificationLog');
const config = require('../config/env');

let transporter = null;

/**
 * Initialize or return singleton Nodemailer transporter (created once at module load)
 */
const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const user = config.GMAIL_USER || config.SMTP_USER;
  const pass = config.GMAIL_APP_PASSWORD || config.SMTP_PASS;

  if (config.ENABLE_EMAIL_NOTIFICATIONS && user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
    console.log(`[EmailService] Nodemailer initialized with Gmail SMTP (${user})`);
  } else {
    // Development / Mock Transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(
          `[EmailService MOCK] [To: ${mailOptions.to}] [Subject: "${mailOptions.subject}"]`
        );
        return {
          messageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          accepted: [mailOptions.to],
        };
      },
      verify: async () => {
        return true;
      },
    };
    console.log('[EmailService] Running in Development / Mock Mode (Emails logged to console)');
  }

  return transporter;
};

// Initialize transporter at module load
getTransporter();

/**
 * Verify transporter at server startup (logs clear warning, never crashes)
 */
const verifyTransporter = async () => {
  const activeTransporter = getTransporter();
  if (activeTransporter && typeof activeTransporter.verify === 'function') {
    try {
      await activeTransporter.verify();
      console.log('[EmailService] SMTP connection verified successfully with Gmail.');
      return true;
    } catch (error) {
      console.warn(
        `[EmailService] SMTP verification warning: ${error.message}. Check GMAIL_USER and GMAIL_APP_PASSWORD.`
      );
      return false;
    }
  }
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
  const mailOptions = {
    from: config.EMAIL_FROM,
    to: recipient,
    subject: subject || 'HealthPulse Hospital Notification',
    html: html || `<p>${text || subject}</p>`,
    text: text || subject,
  };

  const activeTransporter = getTransporter();

  try {
    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[EmailService] Email delivered to ${recipient} (ID: ${info.messageId || 'OK'})`);

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
      messageId: info.messageId,
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
        subject: mailOptions.subject,
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
