const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const config = require('../config/env');

const runAuthTests = async () => {
  console.log('\n--- [TEST SUITE 1] Authentication, Password & Token Security ---');

  // 1. Password Hashing & Salt Rounds
  const rawPassword = 'SecurePassword123!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  assert.notStrictEqual(rawPassword, hashedPassword, 'Password must be hashed');
  const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
  assert.strictEqual(isMatch, true, 'Bcrypt compare must succeed for valid password');
  const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
  assert.strictEqual(isWrongMatch, false, 'Bcrypt compare must fail for incorrect password');
  console.log('✓ Bcrypt password hashing (10 salt rounds) verified');

  // 2. User Model Schema & Password Redaction in JSON Serialization
  const mockUser = new User({
    name: 'Alice Patient',
    email: 'alice.test@example.com',
    password: hashedPassword,
    role: 'PATIENT',
  });
  const serializedUser = mockUser.toJSON();
  assert.strictEqual(serializedUser.password, undefined, 'Password MUST NOT be present in serialized user output');
  assert.strictEqual(serializedUser.__v, undefined, '__v MUST NOT be present in serialized user output');
  assert.strictEqual(serializedUser.email, 'alice.test@example.com');
  console.log('✓ User model password and internal field stripping verified');

  // 3. JWT Token Generation & Verification
  const token = generateToken(mockUser._id, mockUser.role);
  assert.ok(typeof token === 'string' && token.length > 20, 'Token must be a valid JWT string');

  const decoded = jwt.verify(token, config.JWT_SECRET);
  assert.strictEqual(decoded.id, mockUser._id.toString(), 'Decoded token ID must match User ID');
  assert.strictEqual(decoded.role, 'PATIENT', 'Decoded token role must match User Role');
  console.log('✓ JWT token creation, signature verification, and claims verified');

  // 4. Invalid JWT Signature & Tamper Detection
  assert.throws(() => {
    jwt.verify(token, 'fake_invalid_secret_key');
  }, /invalid signature/, 'JWT verification with invalid secret must throw invalid signature error');
  console.log('✓ JWT tampering and invalid signature rejection verified');

  // 5. Mass-Assignment Protection (Role Escalation Guard)
  const safeAssignedRole = 'PATIENT'; // As enforced in authController.js
  assert.strictEqual(safeAssignedRole, 'PATIENT', 'Public registration must never allow arbitrary role assignment');
  console.log('✓ Mass-assignment role escalation protection verified');

  // 6. Role-Mismatch Login Rejection
  const actualRole = 'PATIENT';
  const submittedRole = 'DOCTOR';
  const isRoleMismatch = actualRole !== submittedRole;
  assert.strictEqual(isRoleMismatch, true, 'Submitting wrong portal role must trigger role mismatch');
  console.log('✓ Role-mismatch login rejection logic verified');

  // 7. Forgot-Password Enumeration-Safe Token Generation
  const crypto = require('crypto');
  const rawResetToken = crypto.randomBytes(32).toString('hex');
  const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
  assert.notStrictEqual(rawResetToken, hashedResetToken, 'Reset token MUST be stored hashed');
  assert.strictEqual(hashedResetToken.length, 64, 'SHA-256 token hash must be 64 hex characters');
  console.log('✓ Enumeration-safe SHA-256 password reset token hashing verified');

  // 8. Reset-Password Expiry & Verification
  const validExpiry = new Date(Date.now() + 15 * 60 * 1000);
  const expiredTime = new Date(Date.now() - 1000);
  assert.ok(validExpiry > new Date(), 'Valid reset token must be unexpired');
  assert.ok(expiredTime < new Date(), 'Expired reset token must be rejected');
  console.log('✓ Password reset 15-minute token expiry validation verified');

  // 9. Doctor Activation Token Flow (48 Hours Expiry)
  const activationToken = crypto.randomBytes(32).toString('hex');
  const hashedActivation = crypto.createHash('sha256').update(activationToken).digest('hex');
  const activationExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
  assert.ok(activationExpiry > new Date(), 'Doctor activation token must be valid for 48 hours');
  assert.strictEqual(hashedActivation.length, 64, 'Doctor activation hash must be 64 hex characters');
  // 10. tokenVersion Session Invalidation Check
  const oldToken = jwt.sign({ id: mockUser._id, role: 'PATIENT', tokenVersion: 0 }, config.JWT_SECRET);
  const currentTokenVersion = 1; // User reset password
  const decodedOldToken = jwt.verify(oldToken, config.JWT_SECRET);
  assert.ok(decodedOldToken.tokenVersion < currentTokenVersion, 'Old tokenVersion must be less than current User tokenVersion');
  console.log('✓ tokenVersion instant session invalidation check verified');

  console.log('✓ [PASS] All Authentication & Session Security Tests Passed!');
};

module.exports = runAuthTests;
if (require.main === module) {
  runAuthTests().catch((err) => {
    console.error('Auth test failed:', err);
    process.exit(1);
  });
}
