const profileService = require('../services/profileService');
const {
  validateProfileUpdateInput,
  validateChangePasswordInput,
} = require('../validators/profileValidator');

/**
 * GET /api/patient/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getPatientProfile(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/patient/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const validation = validateProfileUpdateInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const updatedProfile = await profileService.updatePatientProfile(
      req.user.id || req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/patient/profile/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const validation = validateChangePasswordInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { currentPassword, newPassword } = req.body;
    const updatedProfile = await profileService.changePatientPassword(
      req.user.id || req.user._id,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Active sessions have been invalidated.',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
