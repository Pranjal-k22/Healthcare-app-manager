const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOtp,
  setPassword,
  changePassword,
} = require('../controllers/authController');
const { getConnectUrl, handleCallback } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');
const { forgotPasswordLimiter, verifyOtpLimiter } = require('../middleware/rateLimit');

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
router.post('/set-password', setPassword);

// Google OAuth callback (Public redirect from Google)
router.get('/google/callback', handleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.get('/google/connect', protect, getConnectUrl);

module.exports = router;
