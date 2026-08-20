const mongoose = require('mongoose');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const {
  isDateInPast,
  isSlotInPast,
  getWeekdayFromDate,
  addMinutesToTime,
  timeToMinutes,
} = require('../validators/appointmentValidator');

/**
 * Generate discrete appointment slots for a given doctor and date
 * @param {string} doctorId - Doctor User ID or DoctorProfile ID
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<Array<{ startTime: string, endTime: string, available: boolean }>>}
 */
const generateAvailableSlots = async (doctorId, dateStr) => {
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

  const doctorUserId = profile.userId;

  // 2. Reject Past Dates
  if (isDateInPast(dateStr)) {
    return [];
  }

  // 3. Check if Doctor is on Leave on this date
  const isOnLeave = (profile.leaves || []).some((l) => l.date === dateStr);
  if (isOnLeave) {
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

  const bookedStartTimes = new Set(
    existingAppointments.map((app) => app.startTime)
  );

  // 6. Generate Discrete Time Intervals
  const slots = [];
  let currentMinutes = workStartMinutes;

  while (currentMinutes + slotDuration <= workEndMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const startTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    const endTime = addMinutesToTime(startTime, slotDuration);

    // Verify same-day past times and existing bookings
    const isPast = isSlotInPast(dateStr, startTime);
    const isBooked = bookedStartTimes.has(startTime);

    const available = !isPast && !isBooked;

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
