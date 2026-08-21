const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { verifyTransporter } = require('./services/emailService');
const { startReminderJob, stopReminderJob } = require('./services/jobs/reminderJob');
const {
  startMedicationReminderJob,
  stopMedicationReminderJob,
} = require('./services/jobs/medicationReminderJob');
const {
  startBillingAndPrescriptionJob,
  stopBillingAndPrescriptionJob,
} = require('./services/jobs/billingAndPrescriptionJob');
const {
  startEmailRetryJob,
  stopEmailRetryJob,
} = require('./services/jobs/emailRetryJob');

// Connect to Database
connectDB().then(() => {
  // Verify SMTP Transporter (Non-blocking, logs warning on failure)
  verifyTransporter().catch(() => {});

  // Start Background Jobs after DB is connected
  startReminderJob();
  startMedicationReminderJob();
  startBillingAndPrescriptionJob();
  startEmailRetryJob();
});

// Start Server
const server = app.listen(config.PORT, () => {
  console.log(
    `[Server] Running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
  console.log(`[Server] Client Origin: ${config.CLIENT_URL}`);
  console.log(`[Server] Health Check: http://localhost:${config.PORT}/api/health`);
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
  stopReminderJob();
  stopMedicationReminderJob();
  stopBillingAndPrescriptionJob();
  stopEmailRetryJob();
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('[Server] MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server] Unhandled Rejection: ${err.message}`);
  stopReminderJob();
  stopMedicationReminderJob();
  stopBillingAndPrescriptionJob();
  stopEmailRetryJob();
  server.close(() => process.exit(1));
});
