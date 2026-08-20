const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  saveClinicalRecordHandler,
  getClinicalRecordHandler,
  savePrescriptionHandler,
  getPrescriptionHandler,
  getMyPrescriptionsHandler,
  completeConsultationHandler,
} = require('../controllers/clinicalController');

// All routes require authenticated user session
router.use(protect);

// 1. Patient Prescriptions Directory
router.get('/prescriptions/my', requireRole('PATIENT'), getMyPrescriptionsHandler);

// 2. Appointment Clinical Records
router.post(
  '/appointments/:appointmentId/clinical-record',
  requireRole('DOCTOR', 'ADMIN'),
  saveClinicalRecordHandler
);
router.get(
  '/appointments/:appointmentId/clinical-record',
  getClinicalRecordHandler
);

// 3. Appointment Prescriptions
router.post(
  '/appointments/:appointmentId/prescription',
  requireRole('DOCTOR', 'ADMIN'),
  savePrescriptionHandler
);
router.get(
  '/appointments/:appointmentId/prescription',
  getPrescriptionHandler
);

// 4. Complete Consultation Workflow Action
router.post(
  '/appointments/:appointmentId/complete-consultation',
  requireRole('DOCTOR', 'ADMIN'),
  completeConsultationHandler
);

module.exports = router;
