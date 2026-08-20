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

// 1. Google OAuth Callback (Public redirect from Google)
router.get('/oauth/callback', oauthCallbackHandler);

// 2. Protected Routes (Require active user session)
router.use(protect);

router.get('/oauth/url', getAuthUrlHandler);
router.get('/status', getConnectionStatusHandler);
router.post('/disconnect', disconnectCalendarHandler);
router.post('/sync/:appointmentId', manualSyncHandler);

module.exports = router;
