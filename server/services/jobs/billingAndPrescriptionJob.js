const { markOverdueInvoices } = require('../billingService');
const { updatePrescriptionStatuses } = require('../prescriptionService');

let jobTimer = null;
let isJobRunning = false;

/**
 * Execute daily status updates for invoices and prescriptions
 */
const runDailyStatusUpdates = async () => {
  if (isJobRunning) {
    return;
  }

  isJobRunning = true;

  try {
    const overdueCount = await markOverdueInvoices();
    if (overdueCount > 0) {
      console.log(`[BillingJob] Marked ${overdueCount} overdue invoice(s)`);
    }

    const updatedRxCount = await updatePrescriptionStatuses();
    if (updatedRxCount > 0) {
      console.log(`[PrescriptionJob] Updated status for ${updatedRxCount} prescription(s)`);
    }
  } catch (error) {
    console.error('[BillingAndPrescriptionJob] Error executing status updates:', error.message);
  } finally {
    isJobRunning = false;
  }
};

/**
 * Start the daily status update scheduler (runs every hour)
 */
const startBillingAndPrescriptionJob = () => {
  if (jobTimer) {
    return;
  }

  console.log('[BillingAndPrescriptionJob] Starting background status updater job (Interval: 1 hour)');

  // Run on startup
  runDailyStatusUpdates().catch(() => {});

  // Run every 1 hour (3600000 ms)
  jobTimer = setInterval(() => {
    runDailyStatusUpdates().catch(() => {});
  }, 60 * 60 * 1000);
};

/**
 * Stop the background scheduler
 */
const stopBillingAndPrescriptionJob = () => {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
    console.log('[BillingAndPrescriptionJob] Scheduler stopped.');
  }
};

module.exports = {
  runDailyStatusUpdates,
  startBillingAndPrescriptionJob,
  stopBillingAndPrescriptionJob,
};
