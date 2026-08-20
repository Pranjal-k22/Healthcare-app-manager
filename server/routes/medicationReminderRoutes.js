const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getTodayRemindersHandler,
  getUpcomingRemindersHandler,
  getReminderHistoryHandler,
  markTakenHandler,
  markSkippedHandler,
  getPrescriptionRemindersHandler,
} = require('../controllers/medicationReminderController');

router.use(protect);

// Patient Dose Reminders
router.get(
  '/medication-reminders/today',
  requireRole('PATIENT', 'ADMIN'),
  getTodayRemindersHandler
);
router.get(
  '/medication-reminders/upcoming',
  requireRole('PATIENT', 'ADMIN'),
  getUpcomingRemindersHandler
);
router.get(
  '/medication-reminders/history',
  requireRole('PATIENT', 'ADMIN'),
  getReminderHistoryHandler
);
router.patch(
  '/medication-reminders/:id/taken',
  requireRole('PATIENT'),
  markTakenHandler
);
router.patch(
  '/medication-reminders/:id/skip',
  requireRole('PATIENT'),
  markSkippedHandler
);

// Prescription specific reminders
router.get(
  '/prescriptions/:prescriptionId/reminders',
  getPrescriptionRemindersHandler
);

module.exports = router;
