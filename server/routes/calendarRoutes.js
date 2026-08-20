const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAuthUrlHandler,
  oauthCallbackHandler,
  getConnectionStatusHandler,
  disconnectCalendarHandler,
  manualSyncHandler,
} = require('../controllers/calendarController');

const { generateAuthUrl } = require('../services/google/googleCalendarService');
const config = require('../config/env');

// 1. Direct Browser OAuth Start Route
router.get('/auth', (req, res) => {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    return res.status(400).send('Google Calendar OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
  }
  const userId = req.user ? req.user._id.toString() : 'direct_session';
  const authUrl = generateAuthUrl(userId);
  res.redirect(authUrl);
});

// 2. Google OAuth Callbacks (Public redirect from Google)
router.get('/oauth/callback', oauthCallbackHandler);
router.get('/auth/callback', oauthCallbackHandler);

// 3. Protected Routes (Require active user session)
router.use(protect);

router.get('/oauth/url', getAuthUrlHandler);
router.get('/status', getConnectionStatusHandler);
router.post('/disconnect', disconnectCalendarHandler);
router.post('/sync/:appointmentId', manualSyncHandler);

module.exports = router;

