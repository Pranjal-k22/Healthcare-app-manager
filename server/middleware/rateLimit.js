const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter per Target Email Address for Password Reset Requests (forgot-password)
 * Max 3 requests per account per hour (prevents email spamming attacks on specific accounts)
 */
const forgotPasswordEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => {
    if (req.body && req.body.email) {
      return req.body.email.toLowerCase().trim();
    }
    return req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: true, // Enumeration safe message
    message: "If an account exists, you'll receive instructions by email shortly.",
  },
});

/**
 * Rate Limiter per Source IP for Password Reset Requests (forgot-password)
 * Max 15 requests per IP per hour (allows legitimate shared office NATs while preventing IP botnet spam)
 */
const forgotPasswordIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP address. Please try again after 1 hour.',
  },
});

/**
 * Rate Limiter for Self-Service Token Reset Submissions (reset-password)
 * Max 5 attempts per IP per 10 minutes
 */
const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts from this IP. Please wait 10 minutes before retrying.',
  },
});

/**
 * Rate Limiter for Doctor OTP Verification Attempts (doctor/verify-otp)
 * Max 10 attempts per IP per 10 minutes
 */
const verifyDoctorOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this IP. Please wait 10 minutes before retrying.',
  },
});

module.exports = {
  forgotPasswordEmailLimiter,
  forgotPasswordIpLimiter,
  resetPasswordLimiter,
  verifyDoctorOtpLimiter,
};
