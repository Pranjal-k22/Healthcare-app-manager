const { retryFailedNotifications } = require('../emailService');

let retryJobTimer = null;
let isJobRunning = false;

/**
 * Execute retry cycle for failed email notifications
 */
const runEmailRetryJob = async () => {
  if (isJobRunning) {
    return;
  }

  isJobRunning = true;

  try {
    const result = await retryFailedNotifications(20);
    if (result.retried > 0) {
      console.log(
        `[EmailRetryJob] Processed ${result.retried} failed notifications: ${result.succeeded} succeeded, ${result.markedDead} marked dead.`
      );
    }
  } catch (error) {
    console.error('[EmailRetryJob] Error in retry loop:', error.message);
  } finally {
    isJobRunning = false;
  }
};

/**
 * Start the email retry background scheduler (runs every 10 minutes)
 */
const startEmailRetryJob = () => {
  if (retryJobTimer) {
    return;
  }

  console.log('[EmailRetryJob] Starting background email retry worker (Interval: 10 minutes)');

  // Run on startup
  runEmailRetryJob().catch(() => {});

  // Run every 10 minutes (600,000 ms)
  retryJobTimer = setInterval(() => {
    runEmailRetryJob().catch(() => {});
  }, 10 * 60 * 1000);
};

/**
 * Stop the email retry background scheduler
 */
const stopEmailRetryJob = () => {
  if (retryJobTimer) {
    clearInterval(retryJobTimer);
    retryJobTimer = null;
    console.log('[EmailRetryJob] Email retry worker stopped.');
  }
};

module.exports = {
  runEmailRetryJob,
  startEmailRetryJob,
  stopEmailRetryJob,
};
