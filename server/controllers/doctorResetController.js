const DoctorResetRequest = require('../models/DoctorResetRequest');
const User = require('../models/User');
const otpService = require('../services/otpService');
const notificationService = require('../services/notificationService');

/**
 * @desc    Get doctor password reset requests queue (Admin view)
 * @route   GET /api/admin/doctor-reset-requests
 * @access  Private (Admin only)
 */
const getDoctorResetRequests = async (req, res, next) => {
  try {
    const { status = 'PENDING', limit = 50, page = 1 } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const requests = await DoctorResetRequest.find(query)
      .populate('doctor', 'name email role phone createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await DoctorResetRequest.countDocuments(query);

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
 * @desc    Approve a doctor's password reset request, generate 6-digit OTP, & email doctor
 * @route   POST /api/admin/doctor-reset-requests/:id/approve
 * @access  Private (Admin only)
 */
const approveDoctorReset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    const requestDoc = await DoctorResetRequest.findById(id).populate('doctor');
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Doctor reset request not found',
      });
    }

    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already in status '${requestDoc.status}' and cannot be approved`,
      });
    }

    // Generate 6-digit numeric OTP & 10-minute expiry
    const rawOtp = otpService.generateNumericOtp();
    const hashedOtp = otpService.hashOtp(rawOtp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    requestDoc.status = 'APPROVED';
    requestDoc.otpHash = hashedOtp;
    requestDoc.otpExpires = otpExpires;
    requestDoc.otpAttempts = 0;
    requestDoc.expiresAt = undefined; // Clear TTL eviction date to preserve audit log
    requestDoc.reviewedBy = adminUser._id;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    // Dispatch 6-digit OTP email to Doctor
    notificationService.dispatchDoctorOtpEmail(requestDoc.doctor, requestDoc, rawOtp).catch((err) => {
      console.error('[DoctorResetController] Failed to dispatch OTP email:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `Doctor reset request approved for Dr. ${requestDoc.doctor.name}. Verification OTP has been dispatched to doctor's email.`,
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
 * @desc    Deny a doctor's password reset request
 * @route   POST /api/admin/doctor-reset-requests/:id/deny
 * @access  Private (Admin only)
 */
const denyDoctorReset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminUser = req.user;

    const requestDoc = await DoctorResetRequest.findById(id).populate('doctor');
    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        message: 'Doctor reset request not found',
      });
    }

    if (requestDoc.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already in status '${requestDoc.status}' and cannot be denied`,
      });
    }

    requestDoc.status = 'DENIED';
    requestDoc.expiresAt = undefined; // Clear TTL eviction date to preserve audit log
    requestDoc.reviewedBy = adminUser._id;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    // Dispatch neutral denial notice email to doctor
    notificationService.dispatchDoctorResetDeniedEmail(requestDoc.doctor, requestDoc).catch((err) => {
      console.error('[DoctorResetController] Failed to dispatch denial email:', err.message);
    });

    return res.status(200).json({
      success: true,
      message: `Doctor reset request for Dr. ${requestDoc.doctor.name} has been denied.`,
      data: {
        requestId: requestDoc._id,
        status: requestDoc.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Doctor 6-digit OTP & reset password
 * @route   POST /api/auth/doctor/verify-otp
 * @access  Public
 */
const verifyDoctorOtp = async (req, res, next) => {
  try {
    const { requestId, otp, newPassword } = req.body;
    const GENERIC_OTP_ERROR = 'Invalid or expired verification code';

    if (!requestId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide request ID, verification code, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const requestDoc = await DoctorResetRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(400).json({
        success: false,
        message: GENERIC_OTP_ERROR,
      });
    }

    // Check status APPROVED & unexpired 10-minute OTP
    if (
      requestDoc.status !== 'APPROVED' ||
      !requestDoc.otpExpires ||
      new Date() > new Date(requestDoc.otpExpires)
    ) {
      if (requestDoc.status === 'APPROVED' && new Date() > new Date(requestDoc.otpExpires)) {
        requestDoc.status = 'EXPIRED';
        await requestDoc.save();
      }
      return res.status(400).json({
        success: false,
        message: GENERIC_OTP_ERROR,
      });
    }

    // Increment attempt counter for brute-force tracking
    requestDoc.otpAttempts = (requestDoc.otpAttempts || 0) + 1;

    // Lockout check: max 5 failed attempts
    if (requestDoc.otpAttempts > 5) {
      requestDoc.status = 'EXPIRED';
      await requestDoc.save();
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Request expired.',
      });
    }

    // Constant-time OTP comparison
    const isOtpValid = otpService.compareOtp(otp, requestDoc.otpHash);
    if (!isOtpValid) {
      await requestDoc.save();
      return res.status(400).json({
        success: false,
        message: GENERIC_OTP_ERROR,
      });
    }

    // OTP match! Update Doctor password & increment tokenVersion to revoke active sessions
    const doctorUser = await User.findById(requestDoc.doctor);
    if (!doctorUser) {
      return res.status(404).json({
        success: false,
        message: 'Associated doctor user account not found',
      });
    }

    doctorUser.password = newPassword;
    doctorUser.tokenVersion = (doctorUser.tokenVersion || 0) + 1;
    await doctorUser.save();

    // Mark reset request as COMPLETED
    requestDoc.status = 'COMPLETED';
    await requestDoc.save();

    // Send security notification email
    notificationService.dispatchPasswordChangedAlert(doctorUser).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctorResetRequests,
  approveDoctorReset,
  denyDoctorReset,
  verifyDoctorOtp,
};
