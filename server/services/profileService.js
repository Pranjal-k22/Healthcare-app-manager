const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Get patient profile
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getPatientProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toJSON();
};

/**
 * Update patient profile
 * @param {string} userId
 * @param {object} profileData
 * @returns {Promise<object>}
 */
const updatePatientProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  // Assign allowable fields
  if (profileData.name !== undefined) user.name = profileData.name.trim();
  if (profileData.phone !== undefined) user.phone = profileData.phone.trim();
  if (profileData.dateOfBirth !== undefined) user.dateOfBirth = profileData.dateOfBirth.trim();
  if (profileData.gender !== undefined) user.gender = profileData.gender;

  if (profileData.address && typeof profileData.address === 'object') {
    user.address = {
      line1: profileData.address.line1 || user.address?.line1 || '',
      line2: profileData.address.line2 || user.address?.line2 || '',
      city: profileData.address.city || user.address?.city || '',
      state: profileData.address.state || user.address?.state || '',
      postalCode: profileData.address.postalCode || user.address?.postalCode || '',
      country: profileData.address.country || user.address?.country || 'US',
    };
  }

  if (profileData.emergencyContact && typeof profileData.emergencyContact === 'object') {
    user.emergencyContact = {
      name: profileData.emergencyContact.name || user.emergencyContact?.name || '',
      relationship: profileData.emergencyContact.relationship || user.emergencyContact?.relationship || '',
      phone: profileData.emergencyContact.phone || user.emergencyContact?.phone || '',
    };
  }

  await user.save();
  return user.toJSON();
};

/**
 * Change patient password and increment tokenVersion to invalidate sessions
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
const changePatientPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  // Asynchronously dispatch Security Alert Email
  const { dispatchPasswordChangedAlert } = require('./notificationService');
  dispatchPasswordChangedAlert(user).catch(() => {});

  return user.toJSON();
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  changePatientPassword,
};
