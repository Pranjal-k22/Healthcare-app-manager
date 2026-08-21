const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const SlotHold = require('../models/SlotHold');
const {
  isDateInPast,
  isSlotInPast,
  getWeekdayFromDate,
  addMinutesToTime,
  timeToMinutes,
} = require('../validators/appointmentValidator');
const { isDoctorOnLeave } = require('./leaveService');

/**
 * Generate discrete appointment slots for a given doctor and date
 * @param {string} doctorId - Doctor User ID or DoctorProfile ID
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string|object} [requestingPatientId] - Authenticated patient ID
 * @returns {Promise<Array<{ startTime: string, endTime: string, available: boolean }>>}
 */
const generateAvailableSlots = async (doctorId, dateStr, requestingPatientId = null) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  // 1. Resolve Doctor Profile
  let profile = await DoctorProfile.findOne({ userId: doctorId });
  if (!profile) {
    profile = await DoctorProfile.findById(doctorId);
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Check doctor active & available status
  if (profile.isActive === false || profile.isAvailable === false) {
    return [];
  }

  const doctorUserId = profile.userId;

  // 2. Reject Past Dates
  if (isDateInPast(dateStr)) {
    return [];
  }

  // 3. Check if Doctor is on Leave on this date (DoctorLeave collection)
  const isOnDoctorLeave = await isDoctorOnLeave(doctorUserId, dateStr);
  if (isOnDoctorLeave) {
    return [];
  }

  // 4. Determine Weekday & Working Hours
  const weekday = getWeekdayFromDate(dateStr);
  const daySchedule = profile.workingHours ? profile.workingHours[weekday] : null;

  if (!daySchedule || !daySchedule.enabled || !daySchedule.start || !daySchedule.end) {
    return [];
  }

  const { start: workStart, end: workEnd } = daySchedule;
  const slotDuration = profile.slotDuration || 30;

  const workStartMinutes = timeToMinutes(workStart);
  const workEndMinutes = timeToMinutes(workEnd);

  // 5. Query Existing Active Appointments for this Doctor on this date
  const existingAppointments = await Appointment.find({
    doctorId: doctorUserId,
    date: dateStr,
    status: { $in: ['BOOKED', 'COMPLETED'] },
  }).select('startTime endTime');

  const existingIntervals = existingAppointments.map((app) => ({
    startMin: timeToMinutes(app.startTime),
    endMin: timeToMinutes(app.endTime),
  }));

  // 6. Query Active Unexpired Slot Holds for other patients
  const now = new Date();
  const holdQuery = {
    doctorId: doctorUserId,
    date: dateStr,
    expiresAt: { $gt: now },
  };

  if (requestingPatientId) {
    holdQuery.patientId = { $ne: requestingPatientId };
  }

  const activeHolds = await SlotHold.find(holdQuery).select('startTime');
  const heldStartTimes = new Set(activeHolds.map((h) => h.startTime));

  // 7. Generate Discrete Time Intervals
  const slots = [];
  let currentMinutes = workStartMinutes;

  while (currentMinutes + slotDuration <= workEndMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTime = addMinutesToTime(startTime, slotDuration);
    const endMinutes = currentMinutes + slotDuration;

    // Verify same-day past times
    const isPast = isSlotInPast(dateStr, startTime);

    // Interval conflict overlap check: existing.start < requested.end && existing.end > requested.start
    const hasConflict = existingIntervals.some(
      (intv) => intv.startMin < endMinutes && intv.endMin > currentMinutes
    );

    const isHeldByOther = heldStartTimes.has(startTime);

    const available = !isPast && !hasConflict && !isHeldByOther;

    slots.push({
      startTime,
      endTime,
      available,
    });

    currentMinutes += slotDuration;
  }

  return slots;
};

module.exports = {
  generateAvailableSlots,
};
