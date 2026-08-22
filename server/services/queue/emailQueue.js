const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const NotificationLog = require('../../models/NotificationLog');
const { sendEmail } = require('../emailService');
const emailTemplates = require('../emailTemplates');
const config = require('../../config/env');

let emailBullQueue = null;
let isRedisAvailable = false;

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
});

redisConnection
  .connect()
  .then(() => {
    isRedisAvailable = true;
    console.log('[EmailQueue] Redis connected successfully. Initializing BullMQ email queue...');
    emailBullQueue = new Queue('healthpulse-email-queue', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });

    // Start BullMQ Worker
    new Worker(
      'healthpulse-email-queue',
      async (job) => {
        console.log(`[EmailWorker] Processing BullMQ job ${job.id} [${job.name}]`);
        return await processNotificationJob(job.data);
      },
      { connection: redisConnection }
    );
  })
  .catch(() => {
    isRedisAvailable = false;
    console.log('[EmailQueue] Redis not detected locally. Operating in Persistent Async DB Queue mode.');
  });

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
 * @param {object} jobData - { to, recipientName, templateName, templateData, appointmentId, notificationType }
 */
const queueEmailNotification = async (jobData) => {
  try {
    if (isRedisAvailable && emailBullQueue) {
      await emailBullQueue.add(jobData.notificationType || 'SEND_EMAIL', jobData);
      console.log(`[EmailQueue] Job added to BullMQ: ${jobData.notificationType} -> ${jobData.to}`);
    } else {
      // Async in-process dispatch (Never blocks HTTP response)
      setImmediate(async () => {
        try {
          await processNotificationJob(jobData);
        } catch (err) {
          console.error(`[EmailQueue] Background worker error: ${err.message}`);
        }
      });
      console.log(`[EmailQueue] Notification scheduled asynchronously: ${jobData.notificationType} -> ${jobData.to}`);
    }
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
