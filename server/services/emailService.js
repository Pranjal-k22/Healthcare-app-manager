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
 * Determine actual recipient for development/test mode overrides
 */
const getActualRecipient = (intendedRecipient) => {
  if (process.env.EMAIL_TEST_MODE === 'true' && process.env.EMAIL_TEST_RECIPIENT) {
    return process.env.EMAIL_TEST_RECIPIENT;
  }
  return intendedRecipient;
};

/**
 * Check if a Resend error is unrecoverable / permanent
 */
function isPermanentResendError(error) {
  if (!error) return false;
  const status = Number(error.statusCode || error.status || error.httpStatus || 0);
  const code = String(error.name || error.code || '').toLowerCase();
  const message = String(error.message || '').toLowerCase();

  // Authentication/configuration/request errors
  if ([400, 401, 403, 404, 405, 422].includes(status)) {
    return true;
  }
  // Resend sandbox limitation
  if (message.includes('you can only send testing emails to your own email address')) {
    return true;
  }
  // Unverified sender domain
  if (message.includes('domain') && message.includes('not verified')) {
    return true;
  }
  // Bad request / validation
  if (
    code.includes('validation_error') ||
    code.includes('invalid_parameter') ||
    code.includes('missing_required') ||
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('403') ||
    message.includes('422')
  ) {
    return true;
  }
  return false;
}

/**
 * Check if a Resend error is transient (retryable)
 */
function isTransientResendError(error) {
  if (!error) return false;
  const status = Number(error.statusCode || error.status || error.httpStatus || 0);
  const code = String(error.code || error.name || '').toUpperCase();
  const message = String(error.message || '').toUpperCase();

  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }
  if (
    ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENETUNREACH', 'EAI_AGAIN'].some((c) =>
      code.includes(c) || message.includes(c)
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Standardize provider errors for circuit breaker decisions
 */
function normalizeResendError(error) {
  const providerError = new Error(error?.message || 'Resend email sending failed');
  providerError.name = 'EmailProviderError';
  providerError.provider = 'resend';
  providerError.statusCode = error?.statusCode || error?.status || null;
  providerError.providerCode = error?.name || error?.code || null;
  providerError.permanent = isPermanentResendError(error);
  providerError.transient = isTransientResendError(error);
  providerError.rawProviderError = error;
  return providerError;
}

/**
 * Calculate progressive exponential retry delay
 */
function calculateNextRetry(attempt) {
  const delays = [
    60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    30 * 60 * 1000, // 30 minutes
    2 * 60 * 60 * 1000, // 2 hours
  ];
  const delay = delays[Math.min(attempt - 1, delays.length - 1)];
  return new Date(Date.now() + delay);
}

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
    return { success: false, error: 'Recipient email missing', permanent: true };
  }

  const rawRecipient = Array.isArray(to) ? to.join(', ') : to.trim().toLowerCase();
  const actualRecipient = getActualRecipient(rawRecipient);
  console.log(`[EMAIL] intended=${rawRecipient}, actual=${actualRecipient}`);

  const mailPayload = {
    from: config.EMAIL_FROM || 'HealthPulse <onboarding@resend.dev>',
    to: [actualRecipient],
    subject: subject || 'HealthPulse Hospital Notification',
    html: html || `<p>${text || subject}</p>`,
    ...(text && { text }),
    ...(config.EMAIL_REPLY_TO && { replyTo: config.EMAIL_REPLY_TO }),
  };

  const effectiveIdempotencyKey =
    idempotencyKey || (appointmentId ? `${notificationType.toLowerCase()}-${appointmentId}` : undefined);

  // If email notifications are disabled or API key is missing, execute in Mock Mode
  if (!config.ENABLE_EMAIL_NOTIFICATIONS || !config.RESEND_API_KEY) {
    console.log(`[EmailService MOCK] intended=${rawRecipient} actual=${actualRecipient} [Subject: "${mailPayload.subject}"]`);
    const mockId = `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: rawRecipient,
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
      provider: 'resend-mock',
      messageId: mockId,
      emailId: mockId,
      logId: logEntry ? logEntry._id : null,
      intendedRecipient: rawRecipient,
      actualRecipient,
    };
  }

  // Real Resend API Send via HTTPS SDK
  try {
    const resend = getResendClient();
    const options = effectiveIdempotencyKey ? { idempotencyKey: effectiveIdempotencyKey } : undefined;

    const { data, error } = await resend.emails.send(mailPayload, options);

    if (error) {
      throw normalizeResendError(error);
    }

    const emailId = data.id || `resend-${Date.now()}`;
    console.log(`[EMAIL SUCCESS] intended=${rawRecipient} actual=${actualRecipient} id=${emailId}`);

    // Write success to NotificationLog (only if not a retry cycle)
    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: rawRecipient,
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
      provider: 'resend',
      messageId: emailId,
      emailId,
      logId: logEntry ? logEntry._id : null,
      intendedRecipient: rawRecipient,
      actualRecipient,
    };
  } catch (rawError) {
    const normalized = rawError?.name === 'EmailProviderError' ? rawError : normalizeResendError(rawError);
    console.error('[EMAIL FAILURE]', {
      intendedRecipient: rawRecipient,
      actualRecipient,
      statusCode: normalized.statusCode,
      providerCode: normalized.providerCode,
      permanent: normalized.permanent,
      transient: normalized.transient,
      message: normalized.message,
    });

    const attempts = 1;
    const isPermanent = normalized.permanent;

    const status = isPermanent ? 'dead' : 'failed';
    const nextRetryAt = isPermanent ? null : calculateNextRetry(attempts);

    let logEntry = null;
    if (!isRetry) {
      try {
        logEntry = await NotificationLog.create({
          recipientEmail: rawRecipient,
          recipientName: recipientName || payload.recipientName || '',
          notificationType,
          appointmentId,
          subject: mailPayload.subject,
          payload,
          status,
          attempts,
          lastError: normalized.message,
          nextRetryAt,
          deadAt: isPermanent ? new Date() : null,
        });
      } catch (logErr) {
        console.warn('[EmailService] Warning writing failure NotificationLog:', logErr.message);
      }
    }

    return {
      success: false,
      error: normalized.message,
      normalizedError: normalized,
      permanent: isPermanent,
      logId: logEntry ? logEntry._id : null,
    };
  }
};

/**
 * Background Retry Job: Retries failed notifications with exponential backoff
 * Marks notifications as 'dead' after MAX_ATTEMPTS (5) or on permanent failures
 * @param {number} maxBatch - Maximum logs to process per run (default: 20)
 */
const retryFailedNotifications = async (maxBatch = 20) => {
  const now = new Date();
  const MAX_ATTEMPTS = 5;

  try {
    const failedLogs = await NotificationLog.find({
      status: 'failed',
      attempts: { $lt: MAX_ATTEMPTS },
      $or: [
        { nextRetryAt: { $lte: now } },
        { nextRetryAt: null }
      ],
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
        console.log(`[RETRY SUCCESS] notification=${log._id} -> ${log.recipientEmail}`);
      } else {
        const normalized = retryResult.normalizedError || normalizeResendError({ message: retryResult.error });
        const isPermanent = Boolean(retryResult.permanent || normalized.permanent);

        log.attempts = currentAttempts;
        log.lastError = retryResult.error || 'Retry failed';

        const maxLimit = log.maxAttempts || MAX_ATTEMPTS;

        if (isPermanent) {
          log.status = 'dead';
          log.deadAt = new Date();
          log.nextRetryAt = null;
          markedDead++;
          console.error(`[EMAIL DEAD] ${log._id}`, normalized.message);
        } else if (currentAttempts >= maxLimit) {
          log.status = 'dead';
          log.deadAt = new Date();
          log.nextRetryAt = null;
          markedDead++;
          console.error(`[EMAIL DEAD MAX RETRIES] ${log._id}`);
        } else {
          log.status = 'failed';
          log.nextRetryAt = calculateNextRetry(currentAttempts);
          console.warn(`[EMAIL RETRY SCHEDULED] ${log._id}`, log.nextRetryAt);
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
  getActualRecipient,
  isPermanentResendError,
  isTransientResendError,
  normalizeResendError,
  calculateNextRetry,
  verifyTransporter,
  sendEmail,
  retryFailedNotifications,
};
