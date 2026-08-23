const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a JWT token containing user id and role
 * @param {string} id - User ObjectId
 * @param {string} role - User Role ('PATIENT' | 'DOCTOR' | 'ADMIN')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role, tokenVersion = 0) => {
  return jwt.sign(
    {
      id,
      role,
      tokenVersion,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    }
  );
};

module.exports = generateToken;
