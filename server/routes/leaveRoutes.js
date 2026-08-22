const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createLeaveHandler,
  getMyLeavesHandler,
  checkConflictsHandler,
  cancelLeaveHandler,
  getAllLeavesAdminHandler,
  updateLeaveStatusAdminHandler,
} = require('../controllers/leaveController');

// All leave operations require authentication
router.use(protect);

// Doctor Leave Endpoints
router.post('/doctor/leaves', requireRole('DOCTOR'), createLeaveHandler);
router.get('/doctor/leaves', requireRole('DOCTOR'), getMyLeavesHandler);
router.get('/doctor/leaves/conflicts', requireRole('DOCTOR'), checkConflictsHandler);
router.patch('/doctor/leaves/:id/cancel', requireRole('DOCTOR', 'ADMIN'), cancelLeaveHandler);

// Admin Leave Endpoints
router.get('/admin/leaves', requireRole('ADMIN'), getAllLeavesAdminHandler);
router.patch('/admin/leaves/:id/status', requireRole('ADMIN'), updateLeaveStatusAdminHandler);

module.exports = router;
