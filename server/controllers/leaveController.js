const {
  createDoctorLeave,
  getDoctorLeaves,
  getConflictingAppointments,
  cancelDoctorLeave,
  getAllLeavesAdmin,
  validateLeaveDates,
  updateDoctorLeaveStatusAdmin,
} = require('../services/leaveService');

/**
 * @desc    Create/request a new leave for the authenticated doctor
 * @route   POST /api/doctor/leaves
 * @access  Private (Doctor only)
 */
const createLeaveHandler = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { startDate, endDate, reason } = req.body;

    const leave = await createDoctorLeave(doctorId, {
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: 'Leave successfully registered',
      data: leave,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        conflict: true,
        conflictingAppointments: error.conflictingAppointments || [],
      });
    }
    next(error);
  }
};

/**
 * @desc    Get leave records for the authenticated doctor
 * @route   GET /api/doctor/leaves
 * @access  Private (Doctor only)
 */
const getMyLeavesHandler = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const leaves = await getDoctorLeaves(doctorId, { status: req.query.status });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pre-check for conflicting appointments before applying for leave
 * @route   GET /api/doctor/leaves/conflicts
 * @access  Private (Doctor only)
 */
const checkConflictsHandler = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { startDate, endDate } = req.query;

    validateLeaveDates(startDate, endDate);

    const conflicts = await getConflictingAppointments(doctorId, startDate, endDate);

    res.status(200).json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflictCount: conflicts.length,
        conflictingAppointments: conflicts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a doctor leave
 * @route   PATCH /api/doctor/leaves/:id/cancel
 * @access  Private (Doctor & Admin)
 */
const cancelLeaveHandler = async (req, res, next) => {
  try {
    const leave = await cancelDoctorLeave(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Leave cancelled successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: View all doctor leaves
 * @route   GET /api/admin/leaves
 * @access  Private (Admin only)
 */
const getAllLeavesAdminHandler = async (req, res, next) => {
  try {
    const leaves = await getAllLeavesAdmin({
      status: req.query.status,
      doctorId: req.query.doctorId,
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Approve or Reject a doctor leave request
 * @route   PATCH /api/admin/leaves/:id/status
 * @access  Private (Admin only)
 */
const updateLeaveStatusAdminHandler = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const leave = await updateDoctorLeaveStatusAdmin(
      req.params.id,
      { status, adminNotes },
      req.user
    );

    res.status(200).json({
      success: true,
      message: `Doctor leave request marked as ${status} successfully. Confirmation email sent to doctor.`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveHandler,
  getMyLeavesHandler,
  checkConflictsHandler,
  cancelLeaveHandler,
  getAllLeavesAdminHandler,
  updateLeaveStatusAdminHandler,
};
