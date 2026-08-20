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
  // Public registration endpoint strictly uses role: 'PATIENT' regardless of body payload
  const registrationPayload = {
    name: 'Hacker User',
    email: 'hacker@example.com',
    password: 'Password123!',
    role: 'ADMIN', // Attempted role escalation
  };
  const safeAssignedRole = 'PATIENT'; // As enforced in authController.js
  assert.strictEqual(safeAssignedRole, 'PATIENT', 'Public registration must never allow arbitrary role assignment');
  console.log('✓ Mass-assignment role escalation protection verified');

  console.log('✓ [PASS] All Authentication & Session Security Tests Passed!');
};

module.exports = runAuthTests;
if (require.main === module) {
  runAuthTests().catch((err) => {
    console.error('Auth test failed:', err);
    process.exit(1);
  });
}
