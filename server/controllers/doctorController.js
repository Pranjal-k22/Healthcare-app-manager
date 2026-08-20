const doctorService = require('../services/doctorService');
const {
  validateCreateDoctorInput,
  validateUpdateDoctorInput,
  validateLeaveInput,
} = require('../validators/doctorValidator');

/**
 * @desc    Create a new doctor (Admin only)
 * @route   POST /api/doctors
 * @access  Private/Admin
 */
const createDoctor = async (req, res, next) => {
  try {
    const validation = validateCreateDoctorInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const doctor = await doctorService.createDoctor(req.body);

    return res.status(201).json({
      success: true,
      message: 'Doctor account and profile created successfully',
      data: doctor,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all doctors with optional search and specialization filters
 * @route   GET /api/doctors
 * @access  Private (Authenticated users)
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, search } = req.query;
    const doctors = await doctorService.getAllDoctors({ specialization, search });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Private (Authenticated users)
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get current doctor's own profile
 * @route   GET /api/doctors/me
 * @access  Private/Doctor
 */
const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorByUserId(req.user._id);

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Update doctor profile (Admin only)
 * @route   PUT /api/doctors/:id
 * @access  Private/Admin
 */
const updateDoctor = async (req, res, next) => {
  try {
    const validation = validateUpdateDoctorInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const doctor = await doctorService.updateDoctor(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctor,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Add a leave date for a doctor (Admin only)
 * @route   POST /api/doctors/:id/leave
 * @access  Private/Admin
 */
const addLeave = async (req, res, next) => {
  try {
    const validation = validateLeaveInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const leaves = await doctorService.addDoctorLeave(req.params.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Doctor leave scheduled successfully',
      data: leaves,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Remove a scheduled leave date for a doctor (Admin only)
 * @route   DELETE /api/doctors/:id/leave/:date
 * @access  Private/Admin
 */
const removeLeave = async (req, res, next) => {
  try {
    const leaves = await doctorService.removeDoctorLeave(
      req.params.id,
      req.params.date
    );

    return res.status(200).json({
      success: true,
      message: 'Doctor leave removed successfully',
      data: leaves,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all scheduled leaves for a doctor
 * @route   GET /api/doctors/:id/leaves
 * @access  Private
 */
const getLeaves = async (req, res, next) => {
  try {
    const leaves = await doctorService.getDoctorLeaves(req.params.id);

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  addLeave,
  removeLeave,
  getLeaves,
};
