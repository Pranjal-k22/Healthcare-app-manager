const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clinicalRoutes = require('./routes/clinicalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const medicationReminderRoutes = require('./routes/medicationReminderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const billingRoutes = require('./routes/billingRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust reverse proxy (1 hop for Render ingress proxy) to satisfy express-rate-limit
app.set('trust proxy', 1);

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
const configuredClientUrl = (config.CLIENT_URL || '').replace(/\/+$/, '');
const configuredFrontendUrl = (config.FRONTEND_URL || '').replace(/\/+$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://health-pulse.app',
  'https://www.health-pulse.app',
  'https://healthpluse.vercel.app',
  'https://healthcare-app-manager.vercel.app',
  configuredClientUrl,
  configuredFrontendUrl,
  process.env.CLIENT_URL,
  process.env.CLIENT_WWW_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin header (Postman, server-to-server, curl)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(normalizedOrigin) ||
        /^https:\/\/(healthcare-app-manager|healthpluse|health-pulse)(-[a-z0-9-]+)?\.(vercel\.app|app)$/.test(normalizedOrigin)
      ) {
        return callback(null, true);
      }

      console.log('[CORS] Blocked origin:', origin);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers (with payload size limit to prevent memory exhaustion attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Rate Limiting on Authentication Endpoints (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
app.use('/api/auth', authLimiter);

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HealthPulse API is healthy (Phase 11 Production Ready)',
    timestamp: new Date().toISOString(),
  });
});

// Dev-Only Testing Endpoints (Disabled in Production)
const devRoutes = require('./routes/devRoutes');
app.use('/api/dev', devRoutes);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', leaveRoutes);
app.use('/api', medicationReminderRoutes);
app.use('/api', clinicalRoutes);
app.use('/api/patient', profileRoutes);
app.use('/api/patient', billingRoutes);
app.use('/api/patient', prescriptionRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
