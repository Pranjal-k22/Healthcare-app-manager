const mongoose = require('mongoose');
const config = require('../config/env');
const { isValidTimeFormat, isValidDateFormat } = require('./doctorValidator');

const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/**
 * Get current system date in YYYY-MM-DD formatted for APPOINTMENT_TIMEZONE
 * @returns {string}
 */
const getTodayDateString = () => {
  const tz = config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
  }).format(new Date());
};

/**
 * Get current system time in HH:mm formatted for APPOINTMENT_TIMEZONE
 * @returns {string}
 */
const getCurrentTimeString = () => {
  const tz = config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === 'hour')?.value || '00';
  const minute = parts.find((p) => p.type === 'minute')?.value || '00';
  return `${hour}:${minute}`;
};

/**
 * Check if date is in the past (before today)
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
const isDateInPast = (dateStr) => {
  const today = getTodayDateString();
  return dateStr < today;
};

/**
 * Check if a time slot on a given date has already passed
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:mm
 * @returns {boolean}
 */
const isSlotInPast = (dateStr, timeStr) => {
  const today = getTodayDateString();
  if (dateStr < today) return true;
  if (dateStr === today) {
    const currentTime = getCurrentTimeString();
    return timeStr <= currentTime;
  }
  return false;
};

/**
 * Get normalized day key (monday, tuesday, etc.) from YYYY-MM-DD
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
const getWeekdayFromDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return WEEKDAY_NAMES[dateObj.getDay()];
};

/**
 * Add integer minutes to a 24-hour time string
 * @param {string} timeStr - HH:mm
 * @param {number} minutesToAdd
 * @returns {string} - HH:mm
 */
const addMinutesToTime = (timeStr, minutesToAdd) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

/**
 * Convert HH:mm to total minutes from midnight
 * @param {string} timeStr
 * @returns {number}
 */
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Validate booking payload from client
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateBookingInput = (data) => {
  const { doctorId, date, startTime, reason } = data;

  if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
    return { valid: false, error: 'A valid Doctor ID is required' };
  }

  if (!date || !isValidDateFormat(date)) {
    return { valid: false, error: 'A valid appointment date (YYYY-MM-DD) is required' };
  }

  if (isDateInPast(date)) {
    return { valid: false, error: 'Appointments cannot be booked for past dates' };
  }

  if (!startTime || !isValidTimeFormat(startTime)) {
    return { valid: false, error: 'A valid start time (HH:mm) is required' };
  }

  if (isSlotInPast(date, startTime)) {
    return { valid: false, error: 'Cannot book a time slot that has already passed' };
  }

  if (reason && typeof reason === 'string' && reason.length > 500) {
    return { valid: false, error: 'Reason/notes cannot exceed 500 characters' };
  }

  return { valid: true };
};

/**
 * Validate reschedule payload from client
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateRescheduleInput = (data) => {
  const { date, startTime } = data;

  if (!date || !isValidDateFormat(date)) {
    return { valid: false, error: 'A valid appointment date (YYYY-MM-DD) is required' };
  }

  if (isDateInPast(date)) {
    return { valid: false, error: 'Appointments cannot be rescheduled to past dates' };
  }

  if (!startTime || !isValidTimeFormat(startTime)) {
    return { valid: false, error: 'A valid start time (HH:mm) is required' };
  }

  if (isSlotInPast(date, startTime)) {
    return { valid: false, error: 'Cannot reschedule to a time slot that has already passed' };
  }

  return { valid: true };
};

module.exports = {
  getTodayDateString,
  getCurrentTimeString,
  isDateInPast,
  isSlotInPast,
  getWeekdayFromDate,
  addMinutesToTime,
  timeToMinutes,
  validateBookingInput,
  validateRescheduleInput,
};
