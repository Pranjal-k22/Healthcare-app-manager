/**
 * Validate patient profile update payload
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateProfileUpdateInput = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  // Ensure immutable fields are not in payload (or ignore them)
  if (data.email !== undefined) {
    return { valid: false, error: 'Email cannot be modified via profile update' };
  }

  if (data.role !== undefined) {
    return { valid: false, error: 'Role cannot be modified via profile update' };
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters long' };
    }
    if (data.name.length > 100) {
      return { valid: false, error: 'Name cannot exceed 100 characters' };
    }
  }

  if (data.phone !== undefined && data.phone !== '') {
    if (typeof data.phone !== 'string' || data.phone.trim().length < 7) {
      return { valid: false, error: 'Please provide a valid phone number (at least 7 digits)' };
    }
  }

  if (data.dateOfBirth !== undefined && data.dateOfBirth !== '') {
    if (typeof data.dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
      return { valid: false, error: 'Date of birth must be in YYYY-MM-DD format' };
    }
  }

  if (data.gender !== undefined && data.gender !== '') {
    const validGenders = ['Female', 'Male', 'Non-Binary', 'Prefer not to say', 'Other'];
    if (!validGenders.includes(data.gender)) {
      return { valid: false, error: `Gender must be one of: ${validGenders.join(', ')}` };
    }
  }

  if (data.address !== undefined) {
    if (typeof data.address !== 'object' || Array.isArray(data.address)) {
      return { valid: false, error: 'Address must be an object' };
    }
  }

  if (data.emergencyContact !== undefined) {
    if (typeof data.emergencyContact !== 'object' || Array.isArray(data.emergencyContact)) {
      return { valid: false, error: 'Emergency contact must be an object' };
    }
  }

  return { valid: true };
};

/**
 * Validate password change input
 * @param {object} data
 * @returns {{ valid: boolean, error?: string }}
 */
const validateChangePasswordInput = (data) => {
  const { currentPassword, newPassword } = data;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return { valid: false, error: 'Current password is required' };
  }

  if (!newPassword || typeof newPassword !== 'string') {
    return { valid: false, error: 'New password is required' };
  }

  if (newPassword.length < 6) {
    return { valid: false, error: 'New password must be at least 6 characters long' };
  }

  if (currentPassword === newPassword) {
    return { valid: false, error: 'New password must be different from current password' };
  }

  return { valid: true };
};

module.exports = {
  validateProfileUpdateInput,
  validateChangePasswordInput,
};
