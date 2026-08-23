const express = require('express');
const router = express.Router();
const {
  getPasswordRequests,
  approvePasswordRequest,
  denyPasswordRequest,
} = require('../controllers/passwordRequestController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRole('ADMIN'));

router.get('/password-requests', getPasswordRequests);
router.post('/password-requests/:id/approve', approvePasswordRequest);
router.post('/password-requests/:id/deny', denyPasswordRequest);

module.exports = router;
