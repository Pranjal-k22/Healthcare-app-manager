const PasswordResetRequest = require('../models/PasswordResetRequest');
const User = require('../models/User');
const otpService = require('../services/otpService');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get all password reset requests (Admin view)
 * @route   GET /api/admin/password-requests
 * @access  Private (Admin only)
 */
const getPasswordRequests = async (req, res, next) => {
  try {
    const { status = 'PENDING', limit = 50, page = 1 } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const requests = await PasswordResetRequest.find(query)
      .populate('user', 'name email role phone createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await PasswordResetRequest.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a user's password reset request, generate 6-digit OTP, and email user
 * @route   POST /api/admin/password-requests/:id/approve
 * @access  Private (Admin only)
 */
const approvePasswordRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    const requestDoc = await PasswordResetRequest.findById(id).populate('user');
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Password reset request not found',
      });
    }

    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already in status '${requestDoc.status}' and cannot be approved`,
      });
    }

    // Step 2 Rule: Admin cannot approve their own ADMIN-role request if other Admins exist
    if (requestDoc.requestedRole === 'ADMIN' && requestDoc.user._id.toString() === adminUser._id.toString()) {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount > 1) {
        return res.status(403).json({
          success: false,
          message: 'Self-approval forbidden: Another hospital administrator must review your password reset request.',
        });
      }
      // Single-Admin Deployment Gap: Allow self-approval as explicit fallback when total Admin count === 1
      console.warn(`[PasswordRequestController] SINGLE-ADMIN GAP: Admin '${adminUser.email}' self-approved reset request.`);
    }

    // Generate 6-digit numeric OTP & 10-minute expiry
    const rawOtp = otpService.generateNumericOtp();
    const hashedOtp = otpService.hashOtp(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    requestDoc.status = 'APPROVED';
    requestDoc.otpHash = hashedOtp;
    requestDoc.otpExpires = otpExpires;
    requestDoc.otpAttempts = 0;
    requestDoc.reviewedBy = adminUser._id;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    // Dispatch 6-digit OTP email to requester
    notificationService.dispatchOtpEmail(requestDoc.user, requestDoc, rawOtp).catch((err) => {
      console.error('[PasswordRequestController] Failed to dispatch OTP email:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `Password reset request approved for ${requestDoc.user.name}. Verification OTP has been dispatched to user's email.`,
      data: {
        requestId: requestDoc._id,
        status: requestDoc.status,
        otpExpires: requestDoc.otpExpires,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deny a user's password reset request
 * @route   POST /api/admin/password-requests/:id/deny
 * @access  Private (Admin only)
 */
const denyPasswordRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Request declined by hospital administration.' } = req.body;
    const adminUser = req.user;

    const requestDoc = await PasswordResetRequest.findById(id).populate('user');
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Password reset request not found',
      });
    }

    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already in status '${requestDoc.status}' and cannot be denied`,
      });
    }

    requestDoc.status = 'DENIED';
    requestDoc.reviewedBy = adminUser._id;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    return res.status(200).json({
      success: true,
      message: `Password reset request for ${requestDoc.user.name} has been denied.`,
      data: {
        requestId: requestDoc._id,
        status: requestDoc.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPasswordRequests,
  approvePasswordRequest,
  denyPasswordRequest,
};
