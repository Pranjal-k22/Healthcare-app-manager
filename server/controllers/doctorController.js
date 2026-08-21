const {
  validateCreateDoctorInput,
  validateUpdateDoctorInput,
  validateLeaveInput,
} = require('../validators/doctorValidator');
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctor,
  updateDoctorSelf,
  addDoctorLeave,
  removeDoctorLeave,
  getDoctorLeaves,
  setDoctorActiveStatus,
} = require('../services/doctorService');

/**
 * @desc    Create a new doctor (Admin only)
 * @route   POST /api/doctors
 * @access  Private (ADMIN)
 */
const createDoctorHandler = async (req, res, next) => {
  try {
    const validation = validateCreateDoctorInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const doctor = await createDoctor(req.body);

    res.status(201).json({
      success: true,
      message: 'Doctor account and profile created successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors with optional filtering
 * @route   GET /api/doctors
 * @access  Private (All Authenticated)
 */
const getDoctorsHandler = async (req, res, next) => {
  try {
    const { specialization, search, isAvailable, includeInactive } = req.query;
    const doctors = await getAllDoctors({
      specialization,
      search,
      isAvailable,
      includeInactive: req.user && req.user.role === 'ADMIN' ? includeInactive === 'true' : false,
    });

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in doctor profile
 * @route   GET /api/doctors/me
 * @access  Private (DOCTOR)
 */
const getMyDoctorProfileHandler = async (req, res, next) => {
  try {
    const doctor = await getDoctorByUserId(req.user._id);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update currently logged-in doctor profile (Doctor self-service)
 * @route   PUT /api/doctors/me
 * @access  Private (DOCTOR)
 */
const updateMyDoctorProfileHandler = async (req, res, next) => {
  try {
    const validation = validateUpdateDoctorInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const updated = await updateDoctorSelf(req.user._id, req.body);

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private (All Authenticated)
 */
const getDoctorByIdHandler = async (req, res, next) => {
  try {
    const doctor = await getDoctorById(req.params.id);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile (Admin only)
 * @route   PUT /api/doctors/:id
 * @access  Private (ADMIN)
 */
const updateDoctorHandler = async (req, res, next) => {
  try {
    const validation = validateUpdateDoctorInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const updated = await updateDoctor(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle doctor active / deactivated status (Admin only)
 * @route   PATCH /api/doctors/:id/status
 * @access  Private (ADMIN)
 */
const toggleDoctorStatusHandler = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean is required',
      });
    }

    const updated = await setDoctorActiveStatus(req.params.id, isActive);

    res.status(200).json({
      success: true,
      message: `Doctor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add leave date for doctor (Admin only)
 * @route   POST /api/doctors/:id/leave
 * @access  Private (ADMIN)
 */
const addDoctorLeaveHandler = async (req, res, next) => {
  try {
    const validation = validateLeaveInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const result = await addDoctorLeave(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message:
        result.cancelledAppointmentsCount > 0
          ? `Leave scheduled successfully. ${result.cancelledAppointmentsCount} conflicting appointment(s) were cancelled and affected patients notified.`
          : 'Leave scheduled successfully',
      data: result.leaves || result,
      leave: result.leave,
      cancelledAppointmentsCount: result.cancelledAppointmentsCount || 0,
      affectedPatientIds: result.affectedPatientIds || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leaves for doctor
 * @route   GET /api/doctors/:id/leaves
 * @access  Private (All Authenticated)
 */
const getDoctorLeavesHandler = async (req, res, next) => {
  try {
    const leaves = await getDoctorLeaves(req.params.id);

    res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove scheduled leave for doctor (Admin only)
 * @route   DELETE /api/doctors/:id/leave/:date
 * @access  Private (ADMIN)
 */
const removeDoctorLeaveHandler = async (req, res, next) => {
  try {
    const { date } = req.params;
    const leaves = await removeDoctorLeave(req.params.id, date);

    res.status(200).json({
      success: true,
      message: 'Leave removed successfully',
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
