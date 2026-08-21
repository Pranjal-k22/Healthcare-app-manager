const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { startReminderJob, stopReminderJob } = require('./services/jobs/reminderJob');
const {
  startMedicationReminderJob,
  stopMedicationReminderJob,
} = require('./services/jobs/medicationReminderJob');
const {
  startBillingAndPrescriptionJob,
  stopBillingAndPrescriptionJob,
} = require('./services/jobs/billingAndPrescriptionJob');

// Connect to Database
connectDB().then(() => {
  // Start Background Jobs after DB is connected
  startReminderJob();
  startMedicationReminderJob();
  startBillingAndPrescriptionJob();
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
  server.close(() => process.exit(1));
});
