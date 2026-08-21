const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getBillingSummary,
  getInvoices,
  getInvoiceDetail,
  payInvoice,
} = require('../controllers/billingController');

const router = express.Router();

// Rate limiter for payment attempts
const payLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment requests submitted. Please try again after 15 minutes.',
  },
});

// Protect all billing routes & restrict to PATIENT
router.use(protect);
router.use(authorizeRoles('PATIENT'));

router.get('/billing/summary', getBillingSummary);
router.get('/billing', getInvoices);
router.get('/billing/:id', getInvoiceDetail);
router.post('/billing/:id/pay', payLimiter, payInvoice);

module.exports = router;
