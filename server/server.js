const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

// Start Server
const server = app.listen(config.PORT, () => {
  console.log(
    `[Server] Running in ${config.NODE_ENV} mode on port ${config.PORT}`
  );
  console.log(`[Server] Client Origin: ${config.CLIENT_URL}`);
  console.log(`[Server] Health Check: http://localhost:${config.PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
