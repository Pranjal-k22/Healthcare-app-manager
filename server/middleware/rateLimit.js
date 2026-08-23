const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Password Reset Requests (forgot-password)
 * Max 3 requests per IP per hour
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP. Please try again after 1 hour.',
  },
});

/**
 * Rate Limiter for OTP Verification Attempts (verify-otp)
 * Max 10 attempts per IP per 10 minutes
 */
const verifyOtpLimiter = rateLimit({
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
  forgotPasswordLimiter,
  verifyOtpLimiter,
};
