const mongoose = require('mongoose');
const DoctorLeave = require('../models/DoctorLeave');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const notificationService = require('./notificationService');

/**
 * Validate ISO date string (YYYY-MM-DD)
 */
const isValidDateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

/**
 * Validate leave start and end dates
 */
const validateLeaveDates = (startDate, endDate) => {
  if (!isValidDateFormat(startDate)) {
    const error = new Error('Invalid start date format. Expected YYYY-MM-DD.');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidDateFormat(endDate)) {
    const error = new Error('Invalid end date format. Expected YYYY-MM-DD.');
    error.statusCode = 400;
    throw error;
  }

  if (startDate > endDate) {
    const error = new Error('Start date cannot be after end date.');
    error.statusCode = 400;
    throw error;
  }

  // Prevent requesting leave entirely in the past
  const todayStr = new Date().toISOString().split('T')[0];
  if (endDate < todayStr) {
    const error = new Error('Cannot request leave entirely in the past.');
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Find existing booked appointments conflicting with a date range
 * @param {string} doctorId
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Promise<Array>}
 */
const getConflictingAppointments = async (doctorId, startDate, endDate) => {
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate, $lte: endDate },
    status: 'BOOKED',
  })
    .populate('patientId', 'name email')
    .sort({ date: 1, startTime: 1 })
    .lean();

  return appointments.map((app) => ({
    id: app._id.toString(),
    date: app.date,
    startTime: app.startTime,
    endTime: app.endTime,
    patientName: app.patientId?.name || 'Patient',
    reason: app.reason || 'Consultation',
  }));
};

/**
 * Check if the requested range overlaps with an existing approved/pending leave
 * @param {string} doctorId
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} [excludeLeaveId]
 * @returns {Promise<object|null>}
 */
const getOverlappingLeave = async (doctorId, startDate, endDate, excludeLeaveId = null) => {
  const query = {
    doctorId,
    status: { $in: ['APPROVED', 'PENDING'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeLeaveId && mongoose.Types.ObjectId.isValid(excludeLeaveId)) {
    query._id = { $ne: excludeLeaveId };
  }

  return await DoctorLeave.findOne(query);
};

/**
 * Create a new doctor leave request (status: PENDING awaiting Admin approval)
 * @param {string} doctorId - Authenticated doctor's User ID
 * @param {object} leaveData - { startDate, endDate, reason }
 * @returns {Promise<object>}
 */
const createDoctorLeave = async (doctorId, leaveData) => {
  const { startDate, endDate, reason } = leaveData;

  validateLeaveDates(startDate, endDate);

  if (!reason || !reason.trim()) {
    const error = new Error('Leave reason is required.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Check for overlapping existing leaves
  const overlapping = await getOverlappingLeave(doctorId, startDate, endDate);
  if (overlapping) {
    const error = new Error(
      `Leave request overlaps with an existing ${overlapping.status} leave (${overlapping.startDate} to ${overlapping.endDate}).`
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Check for conflicting appointments
  const conflicts = await getConflictingAppointments(doctorId, startDate, endDate);
  if (conflicts.length > 0) {
    const error = new Error(
      `Cannot apply for leave: You have ${conflicts.length} active booked appointment(s) during this period. Please reschedule or cancel them first.`
    );
    error.statusCode = 409;
    error.conflictingAppointments = conflicts;
    throw error;
  }

  // 3. Persist Leave with PENDING status
  const leave = await DoctorLeave.create({
    doctorId,
    startDate,
    endDate,
    reason: reason.trim(),
    status: 'PENDING',
  });

  // 4. Asynchronously notify Admins of the new leave request
  (async () => {
    try {
      const [doctorUser, profile] = await Promise.all([
        User.findById(doctorId).select('name email'),
        DoctorProfile.findOne({ doctorId }).select('specialization'),
      ]);
      if (doctorUser) {
        await notificationService.dispatchDoctorLeaveRequestedAdminAlert(
          leave,
          doctorUser,
          profile?.specialization || 'General Medicine'
        );
      }
    } catch (err) {
      console.error('[LeaveService] Failed to dispatch leave request alert:', err.message);
    }
  })();

  return leave;
};

/**
 * Get leave history for a specific doctor
 * @param {string} doctorId
 * @param {object} filter - Optional { status }
 * @returns {Promise<Array>}
 */
const getDoctorLeaves = async (doctorId, filter = {}) => {
  const query = { doctorId };
  if (filter.status) {
    query.status = filter.status;
  }

  return await DoctorLeave.find(query).sort({ startDate: -1 });
};

/**
 * Cancel a doctor leave
 * @param {string} leaveId
 * @param {object} requestingUser - Authenticated user
 * @returns {Promise<object>}
 */
const cancelDoctorLeave = async (leaveId, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(leaveId)) {
    const error = new Error('Invalid Leave ID');
    error.statusCode = 400;
    throw error;
  }

  const leave = await DoctorLeave.findById(leaveId);
  if (!leave) {
    const error = new Error('Leave record not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = leave.doctorId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    const error = new Error('Access denied: You are not authorized to cancel this leave');
    error.statusCode = 403;
    throw error;
  }

  if (leave.status === 'CANCELLED') {
    return leave;
  }

  leave.status = 'CANCELLED';
  await leave.save();

  return leave;
};

/**
 * Check if a doctor is on approved leave for a given date
 * @param {string} doctorId
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<boolean>}
 */
const isDoctorOnLeave = async (doctorId, date) => {
  const leaveExists = await DoctorLeave.exists({
    doctorId,
    status: 'APPROVED',
    startDate: { $lte: date },
    endDate: { $gte: date },
  });

  return Boolean(leaveExists);
};

/**
 * Admin: Get all doctor leaves with doctor user details
 */
const getAllLeavesAdmin = async (filter = {}) => {
  const query = {};
  if (filter.status) {
    query.status = filter.status;
  }
  if (filter.doctorId && mongoose.Types.ObjectId.isValid(filter.doctorId)) {
    query.doctorId = filter.doctorId;
  }

  return await DoctorLeave.find(query)
    .populate('doctorId', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Admin: Approve or Reject a doctor leave request
 * @param {string} leaveId
 * @param {object} updateData - { status: 'APPROVED' | 'REJECTED', adminNotes?: string }
 * @param {object} adminUser - Authenticated Admin
 * @returns {Promise<object>}
 */
const updateDoctorLeaveStatusAdmin = async (leaveId, updateData, adminUser) => {
  if (!mongoose.Types.ObjectId.isValid(leaveId)) {
    const error = new Error('Invalid Leave ID');
    error.statusCode = 400;
    throw error;
  }

  const { status, adminNotes = '' } = updateData;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    const error = new Error('Status must be either APPROVED or REJECTED');
    error.statusCode = 400;
    throw error;
  }

  const leave = await DoctorLeave.findById(leaveId);
  if (!leave) {
    const error = new Error('Leave record not found');
    error.statusCode = 404;
    throw error;
  }

  if (leave.status === 'CANCELLED') {
    const error = new Error('Cannot modify a cancelled leave record');
    error.statusCode = 400;
    throw error;
  }

  leave.status = status;
  if (status === 'APPROVED') {
    leave.approvedBy = adminUser._id;
    leave.approvedAt = new Date();
    leave.rejectedBy = null;
    leave.rejectedAt = null;
    leave.rejectionReason = '';
  } else {
    leave.rejectedBy = adminUser._id;
    leave.rejectedAt = new Date();
    leave.rejectionReason = adminNotes.trim() || 'Declined by Administrator';
    leave.approvedBy = null;
    leave.approvedAt = null;
  }

  await leave.save();

  // Asynchronously dispatch decision confirmation email to the doctor
  (async () => {
    try {
      const doctorUser = await User.findById(leave.doctorId).select('name email');
      if (doctorUser) {
        await notificationService.dispatchDoctorLeaveDecisionDoctorAlert(
          leave,
          doctorUser,
          adminUser,
          adminNotes
        );
      }
    } catch (err) {
      console.error('[LeaveService] Failed to dispatch leave decision alert:', err.message);
    }
  })();

  return leave;
};

module.exports = {
  isValidDateFormat,
  validateLeaveDates,
  getConflictingAppointments,
  getOverlappingLeave,
  createDoctorLeave,
  getDoctorLeaves,
  cancelDoctorLeave,
  isDoctorOnLeave,
  getAllLeavesAdmin,
  updateDoctorLeaveStatusAdmin,
};
