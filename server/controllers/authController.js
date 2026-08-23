const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const notificationService = require('../services/notificationService');

/**
 * @desc    Register a new patient user (Public registration is strictly PATIENT only)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'PATIENT' } = req.body;

    // Reject public Admin/Doctor registration attempts
    if (role && ['ADMIN', 'DOCTOR'].includes(role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Public registration for Doctor and Administrator roles is disabled. Please contact system administration.',
      });
    }

    // Validate presence of required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Create patient entity strictly
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'PATIENT',
    });

    const token = generateToken(user._id, user.role, user.tokenVersion || 0);

    return res.status(201).json({
      success: true,
      message: 'Patient account registered successfully',
      token,
      user: {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & validate submitted portal role (Enumeration-Safe)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 1. Validate password FIRST to prevent account/role enumeration attacks
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 2. Validate role mismatch SECOND (only after password verification succeeds)
    if (role && user.role !== role.toUpperCase()) {
      return res.status(400).json({
        success: false,
        code: 'ROLE_MISMATCH',
        message: `Account role mismatch. This email is registered as a ${user.role}. Please select the ${user.role.charAt(0) + user.role.slice(1).toLowerCase()} portal.`,
      });
    }

    const token = generateToken(user._id, user.role, user.tokenVersion || 0);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user fresh from MongoDB
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset email (Enumeration-safe)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const GENERIC_SUCCESS_MSG = 'If an account exists with this email, a password reset link has been sent.';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Enumeration safety: Always return 200 generic message regardless of user existence
    if (!user || (role && user.role !== role.toUpperCase())) {
      return res.status(200).json({
        success: true,
        message: GENERIC_SUCCESS_MSG,
      });
    }

    // Generate crypto random token & store SHA-256 hash in DB with 15-minute expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Dispatch email via notificationService (Resend SDK)
    notificationService.dispatchPasswordResetEmail(user, resetToken).catch((err) => {
      console.error('[AuthController] Failed to dispatch reset email:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: GENERIC_SUCCESS_MSG,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using valid 15-minute reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both reset token and new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Hash incoming token & lookup matching unexpired record
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    // Set new password, clear reset token fields, & increment tokenVersion to invalidate active sessions
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Send security notification alert
    notificationService.dispatchPasswordChangedAlert(user).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Doctor First-Time Account Activation / Set Password (Dedicated activationToken field)
 * @route   POST /api/auth/set-password
 * @access  Public
 */
const setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both activation token and new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 1. Check dedicated activationToken field
    let user = await User.findOne({
      activationToken: hashedToken,
      activationExpires: { $gt: new Date() },
    });

    // 2. Fallback check for passwordResetToken
    if (!user) {
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Activation token is invalid or has expired',
      });
    }

    user.password = password;
    user.activationToken = undefined;
    user.activationExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    notificationService.dispatchPasswordChangedAlert(user).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Account activated successfully. Please sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for authenticated user (Patient, Doctor, Admin)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Set new password (triggers bcrypt hashing in User pre-save hook)
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Send security notification email
    notificationService.dispatchPasswordChangedAlert(user).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  setPassword,
  changePassword,
};
