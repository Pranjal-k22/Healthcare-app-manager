const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { getConnectUrl, handleCallback } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth callback (Public redirect from Google)
router.get('/google/callback', handleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.get('/google/connect', protect, getConnectUrl);

module.exports = router;
