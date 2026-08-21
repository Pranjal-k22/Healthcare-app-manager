const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getPrescriptions,
  getPrescriptionDetail,
} = require('../controllers/prescriptionController');

const router = express.Router();

// Protect all prescription routes & restrict to PATIENT
router.use(protect);
router.use(requireRole('PATIENT'));

router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionDetail);

module.exports = router;
