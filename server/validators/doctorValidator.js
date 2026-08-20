const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const VALID_WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Validate 24-hour time format (HH:mm) from 00:00 to 23:59
 * @param {string} timeStr
 * @returns {boolean}
 */
const isValidTimeFormat = (timeStr) => {
  if (typeof timeStr !== 'string') return false;
  const match = timeStr.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return !!match;
};

/**
 * Ensure start time is strictly earlier than end time
 * @param {string} start - HH:mm
 * @param {string} end - HH:mm
 * @returns {boolean}
 */
const isStartBeforeEnd = (start, end) => {
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  return startTotalMinutes < endTotalMinutes;
};

/**
 * Validate YYYY-MM-DD format and check real calendar existence
 * @param {string} dateStr
 * @returns {boolean}
 */
const isValidDateFormat = (dateStr) => {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;

  // Month days check including leap years
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

/**
 * Validate working hours structure for all 7 days
 * @param {object} workingHours
 * @returns {{ valid: boolean, error?: string }}
 */
const validateWorkingHours = (workingHours) => {
  if (!workingHours || typeof workingHours !== 'object') {
    return { valid: false, error: 'workingHours must be a valid object' };
  }

  for (const day of DAYS_OF_WEEK) {
    const dayConfig = workingHours[day];
    if (!dayConfig) continue; // Default schema handles missing keys

    if (dayConfig.enabled) {
      if (!dayConfig.start || !dayConfig.end) {
        return {
          valid: false,
          error: `Day '${day}' is enabled but missing start or end time`,
        };
      }

      if (!isValidTimeFormat(dayConfig.start)) {
        return {
          valid: false,
          error: `Day '${day}' has invalid start time format '${dayConfig.start}'. Expected HH:mm`,
        };
      }

      if (!isValidTimeFormat(dayConfig.end)) {
        return {
          valid: false,
          error: `Day '${day}' has invalid end time format '${dayConfig.end}'. Expected HH:mm`,
        };
      }

      if (!isStartBeforeEnd(dayConfig.start, dayConfig.end)) {
        return {
          valid: false,
          error: `Day '${day}' start time (${dayConfig.start}) must be before end time (${dayConfig.end})`,
        };
      }
    }
  }

  return { valid: true };
};

/**
 * Validate input for doctor creation
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateCreateDoctorInput = (data) => {
  const {
    name,
    email,
    password,
    specialization,
    slotDuration,
    workingHours,
    experienceYears,
    consultationFee,
    qualifications,
    workingDays,
    bio,
  } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { valid: false, error: 'Doctor name must be at least 2 characters long' };
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'A valid email address is required' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }

  if (!specialization || typeof specialization !== 'string' || specialization.trim().length < 2) {
    return { valid: false, error: 'Specialization is required (at least 2 characters)' };
  }

  if (experienceYears !== undefined) {
    if (typeof experienceYears !== 'number' || experienceYears < 0) {
      return { valid: false, error: 'Experience years must be a non-negative number' };
    }
  }

  if (consultationFee !== undefined) {
    if (typeof consultationFee !== 'number' || consultationFee < 0) {
      return { valid: false, error: 'Consultation fee must be a non-negative number' };
    }
  }

  if (slotDuration !== undefined) {
    if (typeof slotDuration !== 'number' || slotDuration < 5 || slotDuration > 240) {
      return { valid: false, error: 'Slot duration must be a number between 5 and 240 minutes' };
    }
  }

  if (qualifications !== undefined && !Array.isArray(qualifications)) {
    return { valid: false, error: 'Qualifications must be an array of strings' };
  }

  if (workingDays !== undefined) {
    if (!Array.isArray(workingDays)) {
      return { valid: false, error: 'workingDays must be an array' };
    }
    const invalidDay = workingDays.find((d) => !VALID_WORKING_DAYS.includes(d));
    if (invalidDay) {
      return { valid: false, error: `Invalid working day '${invalidDay}'` };
    }
  }

  if (bio && typeof bio === 'string' && bio.length > 2000) {
    return { valid: false, error: 'Bio cannot exceed 2000 characters' };
  }

  if (workingHours) {
    const whValidation = validateWorkingHours(workingHours);
    if (!whValidation.valid) return whValidation;
  }

  return { valid: true };
};

/**
 * Validate input for doctor update
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateUpdateDoctorInput = (data) => {
  const {
    name,
    specialization,
    slotDuration,
    workingHours,
    experienceYears,
    consultationFee,
    qualifications,
    workingDays,
    bio,
  } = data;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return { valid: false, error: 'Doctor name must be at least 2 characters long' };
    }
  }

  if (specialization !== undefined) {
    if (typeof specialization !== 'string' || specialization.trim().length < 2) {
      return { valid: false, error: 'Specialization must be at least 2 characters long' };
    }
  }

  if (experienceYears !== undefined) {
    if (typeof experienceYears !== 'number' || experienceYears < 0) {
      return { valid: false, error: 'Experience years must be a non-negative number' };
    }
  }

  if (consultationFee !== undefined) {
    if (typeof consultationFee !== 'number' || consultationFee < 0) {
      return { valid: false, error: 'Consultation fee must be a non-negative number' };
    }
  }

  if (slotDuration !== undefined) {
    if (typeof slotDuration !== 'number' || slotDuration < 5 || slotDuration > 240) {
      return { valid: false, error: 'Slot duration must be a number between 5 and 240 minutes' };
    }
  }

  if (qualifications !== undefined && !Array.isArray(qualifications)) {
    return { valid: false, error: 'Qualifications must be an array of strings' };
  }

  if (workingDays !== undefined) {
    if (!Array.isArray(workingDays)) {
      return { valid: false, error: 'workingDays must be an array' };
    }
    const invalidDay = workingDays.find((d) => !VALID_WORKING_DAYS.includes(d));
    if (invalidDay) {
      return { valid: false, error: `Invalid working day '${invalidDay}'` };
    }
  }

  if (bio && typeof bio === 'string' && bio.length > 2000) {
    return { valid: false, error: 'Bio cannot exceed 2000 characters' };
  }

  if (workingHours !== undefined) {
    const whValidation = validateWorkingHours(workingHours);
    if (!whValidation.valid) return whValidation;
  }

  return { valid: true };
};

/**
 * Validate leave input
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateLeaveInput = (data) => {
  const { date } = data;

  if (!date || !isValidDateFormat(date)) {
    return {
      valid: false,
      error: 'Invalid leave date. Expected format YYYY-MM-DD with valid calendar day',
    };
  }

  return { valid: true };
};

module.exports = {
  DAYS_OF_WEEK,
  VALID_WORKING_DAYS,
  isValidTimeFormat,
  isStartBeforeEnd,
  isValidDateFormat,
  validateWorkingHours,
  validateCreateDoctorInput,
  validateUpdateDoctorInput,
  validateLeaveInput,
};
