const mongoose = require('mongoose');
const { isValidDateFormat } = require('./doctorValidator');

/**
 * Validate clinical record input
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateClinicalRecordInput = (data) => {
  const { clinicalNotes, diagnosisNotes, patientInstructions, followUpDate } = data;

  if (!clinicalNotes || typeof clinicalNotes !== 'string' || clinicalNotes.trim().length < 3) {
    return {
      valid: false,
      error: 'Clinical notes are required (at least 3 characters)',
    };
  }

  if (clinicalNotes.length > 5000) {
    return {
      valid: false,
      error: 'Clinical notes cannot exceed 5000 characters',
    };
  }

  if (diagnosisNotes && typeof diagnosisNotes === 'string' && diagnosisNotes.length > 2000) {
    return {
      valid: false,
      error: 'Diagnosis notes cannot exceed 2000 characters',
    };
  }

  if (patientInstructions && typeof patientInstructions === 'string' && patientInstructions.length > 3000) {
    return {
      valid: false,
      error: 'Patient instructions cannot exceed 3000 characters',
    };
  }

  if (followUpDate && !isValidDateFormat(followUpDate)) {
    return {
      valid: false,
      error: 'Invalid follow-up date format. Expected YYYY-MM-DD',
    };
  }

  return { valid: true };
};

/**
 * Validate structured prescription input
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validatePrescriptionInput = (data) => {
  const { medicines, additionalInstructions } = data;

  if (medicines !== undefined) {
    if (!Array.isArray(medicines)) {
      return {
        valid: false,
        error: 'Medicines must be an array of medication items',
      };
    }

    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      if (!med || typeof med !== 'object') {
        return {
          valid: false,
          error: `Medicine item #${i + 1} must be a valid object`,
        };
      }

      if (!med.name || typeof med.name !== 'string' || med.name.trim().length < 2) {
        return {
          valid: false,
          error: `Medicine #${i + 1}: Name is required (at least 2 characters)`,
        };
      }

      if (!med.dosage || typeof med.dosage !== 'string' || med.dosage.trim().length === 0) {
        return {
          valid: false,
          error: `Medicine #${i + 1} (${med.name}): Dosage is required (e.g. 500mg)`,
        };
      }

      if (!med.frequency || typeof med.frequency !== 'string' || med.frequency.trim().length === 0) {
        return {
          valid: false,
          error: `Medicine #${i + 1} (${med.name}): Frequency is required (e.g. Twice daily)`,
        };
      }

      if (!med.duration || typeof med.duration !== 'string' || med.duration.trim().length === 0) {
        return {
          valid: false,
          error: `Medicine #${i + 1} (${med.name}): Duration is required (e.g. 5 days)`,
        };
      }
    }
  }

  if (additionalInstructions && typeof additionalInstructions === 'string' && additionalInstructions.length > 2000) {
    return {
      valid: false,
      error: 'Additional instructions cannot exceed 2000 characters',
    };
  }

  return { valid: true };
};

module.exports = {
  validateClinicalRecordInput,
  validatePrescriptionInput,
};
