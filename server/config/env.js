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
};

module.exports = config;
