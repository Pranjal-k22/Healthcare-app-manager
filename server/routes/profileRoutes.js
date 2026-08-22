const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/profileController');
const {
  getStatus: getCalendarStatus,
  disconnect: disconnectCalendar,
} = require('../controllers/calendarController');

const router = express.Router();

// Rate limiter for change-password endpoint
const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again after 15 minutes.',
  },
});

// Protect all profile routes & restrict to PATIENT
router.use(protect);
router.use(requireRole('PATIENT'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/change-password', passwordChangeLimiter, changePassword);

// Google Calendar Patient Endpoints
router.get('/google-calendar/status', getCalendarStatus);
router.post('/google-calendar/disconnect', disconnectCalendar);

module.exports = router;
