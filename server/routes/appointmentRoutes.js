const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getDoctorAppointmentsList,
  getAppointmentDetails,
  cancelAppointmentHandler,
  rescheduleAppointmentHandler,
  completeAppointmentHandler,
  getAllAppointmentsForAdmin,
} = require('../controllers/appointmentController');

// All appointment routes require authenticated sessions
router.use(protect);

// 1. Dynamic Slot Availability (All Authenticated Users)
router.get('/slots/:doctorId/:date', getAvailableSlots);

// 2. Patient Booking & My Appointments (PATIENT Only)
router.post('/', requireRole('PATIENT'), createAppointment);
router.get('/my', requireRole('PATIENT'), getMyAppointments);

// 3. Doctor Consultation List (DOCTOR Only)
router.get('/doctor', requireRole('DOCTOR'), getDoctorAppointmentsList);

// 4. Admin Management Overview (ADMIN Only)
router.get('/admin/all', requireRole('ADMIN'), getAllAppointmentsForAdmin);

// 5. Single Appointment Ownership View
router.get('/:id', getAppointmentDetails);

// 6. Explicit State Transitions
router.patch('/:id/cancel', cancelAppointmentHandler);
router.patch('/:id/reschedule', rescheduleAppointmentHandler);
router.patch(
  '/:id/complete',
  requireRole('DOCTOR', 'ADMIN'),
  completeAppointmentHandler
);

module.exports = router;
