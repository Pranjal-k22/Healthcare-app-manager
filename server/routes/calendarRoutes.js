const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getConnectUrl,
  getStatus,
  disconnect,
  listEvents,
} = require('../controllers/calendarController');

// Protected Calendar Routes (Require active user session)
router.use(protect);

router.get('/connect', getConnectUrl);
router.get('/status', getStatus);
router.post('/disconnect', disconnect);
router.get('/events', listEvents);

module.exports = router;
