const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP using cryptographically secure random integers
 * @returns {string} 6-digit numeric OTP string (e.g. "482910")
 */
const generateNumericOtp = () => {
  const otpNumber = crypto.randomInt(100000, 1000000);
  return otpNumber.toString();
};

/**
 * Compute SHA-256 hash of an OTP string
 * @param {string} otp
 * @returns {string} 64-hex character hash
 */
const hashOtp = (otp) => {
  if (!otp || typeof otp !== 'string') return '';
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

/**
 * Perform constant-time comparison of candidate OTP hash against stored OTP hash
 * @param {string} candidateOtp - Plaintext OTP string submitted by user
 * @param {string} storedHash - 64-hex character SHA-256 hash stored in DB
 * @returns {boolean} True if candidate match is exact
 */
const compareOtp = (candidateOtp, storedHash) => {
  if (!candidateOtp || !storedHash) return false;
  const candidateHash = hashOtp(candidateOtp);

  try {
    const bufA = Buffer.from(candidateHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');

    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateNumericOtp,
  hashOtp,
  compareOtp,
};
