const billingService = require('../services/billingService');
const { validatePaymentInput } = require('../validators/billingValidator');

/**
 * GET /api/patient/billing/summary
 */
const getBillingSummary = async (req, res, next) => {
  try {
    const summary = await billingService.getPatientBillingSummary(
      req.user.id || req.user._id
    );
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/patient/billing
 */
const getInvoices = async (req, res, next) => {
  try {
    const data = await billingService.getPatientInvoices(
      req.user.id || req.user._id,
      req.query
    );
    res.status(200).json({
      success: true,
      data: data.invoices,
      meta: {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/patient/billing/:id
 */
const getInvoiceDetail = async (req, res, next) => {
  try {
    const invoice = await billingService.getPatientInvoiceById(
      req.user.id || req.user._id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/patient/billing/:id/pay
 */
const payInvoice = async (req, res, next) => {
  try {
    const validation = validatePaymentInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { paymentMethod } = req.body;
    const paidInvoice = await billingService.payInvoice(
      req.user.id || req.user._id,
      req.params.id,
      paymentMethod
    );

    res.status(200).json({
      success: true,
      message: 'Invoice settled successfully',
      data: paidInvoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBillingSummary,
  getInvoices,
  getInvoiceDetail,
  payInvoice,
};
