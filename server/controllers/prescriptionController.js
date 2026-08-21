const prescriptionService = require('../services/prescriptionService');

/**
 * GET /api/patient/prescriptions
 */
const getPrescriptions = async (req, res, next) => {
  try {
    const data = await prescriptionService.getPatientPrescriptions(
      req.user.id || req.user._id,
      req.query
    );
    res.status(200).json({
      success: true,
      data: data.prescriptions,
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
 * GET /api/patient/prescriptions/:id
 */
const getPrescriptionDetail = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPatientPrescriptionById(
      req.user.id || req.user._id,
      req.params.id
    );
    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionDetail,
};
