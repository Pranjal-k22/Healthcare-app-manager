const express = require('express');
const router = express.Router();
const {
  getDoctorResetRequests,
  approveDoctorReset,
  denyDoctorReset,
} = require('../controllers/doctorResetController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRole('ADMIN'));

router.get('/doctor-reset-requests', getDoctorResetRequests);
router.post('/doctor-reset-requests/:id/approve', approveDoctorReset);
router.post('/doctor-reset-requests/:id/deny', denyDoctorReset);

module.exports = router;
