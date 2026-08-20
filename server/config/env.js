const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_appointment_db',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_healthcare_jwt_key_phase1_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Super Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@healthcare.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',

  // Email Notification Settings (Phase 5)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 2525,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'HealthPulse <notifications@healthpulse.com>',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',

  // Background Job & Reminder Settings (Phase 5)
  APPOINTMENT_REMINDER_MINUTES: parseInt(process.env.APPOINTMENT_REMINDER_MINUTES, 10) || 60,
  REMINDER_JOB_INTERVAL_MS: parseInt(process.env.REMINDER_JOB_INTERVAL_MS, 10) || 60000,

  // Google Calendar OAuth Settings (Phase 6)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:5000/api/calendar/oauth/callback',
  APPOINTMENT_TIMEZONE: process.env.APPOINTMENT_TIMEZONE || 'UTC',

  // Local Ollama LLM Settings (Phase 10)
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
};

module.exports = config;
