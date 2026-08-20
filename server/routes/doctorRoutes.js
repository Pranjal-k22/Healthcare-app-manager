const express = require('express');
const router = express.Router();
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  addLeave,
  removeLeave,
  getLeaves,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All doctor routes require valid authentication
router.use(protect);

// Doctor self-view (Must precede /:id to prevent matching 'me' as an ObjectId)
router.get('/me', requireRole('DOCTOR'), getMyDoctorProfile);

// Public / Authenticated search & viewing
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/leaves', getLeaves);

// Admin-only management endpoints
router.post('/', requireRole('ADMIN'), createDoctor);
router.put('/:id', requireRole('ADMIN'), updateDoctor);
router.post('/:id/leave', requireRole('ADMIN'), addLeave);
router.delete('/:id/leave/:date', requireRole('ADMIN'), removeLeave);

module.exports = router;
