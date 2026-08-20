const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createDoctorHandler,
  getDoctorsHandler,
  getMyDoctorProfileHandler,
  updateMyDoctorProfileHandler,
  getDoctorByIdHandler,
  updateDoctorHandler,
  toggleDoctorStatusHandler,
  addDoctorLeaveHandler,
  getDoctorLeavesHandler,
  removeDoctorLeaveHandler,
} = require('../controllers/doctorController');
const { getAvailableSlots } = require('../controllers/appointmentController');

// All doctor routes require an authenticated user session
router.use(protect);

// 1. Doctor Directory & Search (Authenticated Users)
router.get('/', getDoctorsHandler);

// 2. Doctor Self Profile (Doctor Only)
router.get('/me', requireRole('DOCTOR'), getMyDoctorProfileHandler);
router.put('/me', requireRole('DOCTOR'), updateMyDoctorProfileHandler);

// 3. Single Doctor Details & Dynamic Slots (Authenticated Users)
router.get('/:id', getDoctorByIdHandler);
router.get('/:id/slots', getAvailableSlots);

// 4. Admin Doctor Provisioning & Updates (Admin Only)
router.post('/', requireRole('ADMIN'), createDoctorHandler);
router.put('/:id', requireRole('ADMIN'), updateDoctorHandler);
router.patch('/:id/status', requireRole('ADMIN'), toggleDoctorStatusHandler);

// 5. Leave Management
router.post('/:id/leave', requireRole('ADMIN'), addDoctorLeaveHandler);
router.get('/:id/leaves', getDoctorLeavesHandler);
router.delete('/:id/leave/:date', requireRole('ADMIN'), removeDoctorLeaveHandler);

module.exports = router;
