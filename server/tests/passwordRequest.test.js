const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const otpService = require('../services/otpService');
const { getPasswordRequests, approvePasswordRequest, denyPasswordRequest } = require('../controllers/passwordRequestController');
const { forgotPassword, verifyOtp } = require('../controllers/authController');

const runPasswordRequestTests = async () => {
  console.log('\n--- [TEST SUITE 15] Admin-Approved OTP Password Reset Workflow ---');

  // Setup Mock Express Req/Res helper
  const createMockReqRes = (body = {}, params = {}, query = {}, user = null, headers = {}) => {
    let statusCode = 200;
    let responseData = null;

    const req = { body, params, query, user, ip: '127.0.0.1', headers };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    return { req, res, getStatus: () => statusCode, getData: () => responseData };
  };

  // Create Mock Test Users
  const patientUser = await User.create({
    name: 'Patient OTP Tester',
    email: `patient.otp.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'PATIENT',
  });

  const adminUser1 = await User.create({
    name: 'Admin OTP Tester 1',
    email: `admin1.otp.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });

  const adminUser2 = await User.create({
    name: 'Admin OTP Tester 2',
    email: `admin2.otp.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });

  // 1. Enumeration-Safe Forgot Password Request
  const reqRes1 = createMockReqRes({ email: patientUser.email, role: 'PATIENT' });
  await forgotPassword(reqRes1.req, reqRes1.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes1.getStatus(), 200, 'Forgot password must return 200 OK');
  assert.strictEqual(reqRes1.getData().success, true);
  assert.ok(reqRes1.getData().message.includes('logged for administrative approval'), 'Must mention admin approval');

  // Verify DB record created with PENDING status
  const pendingReq = await PasswordResetRequest.findOne({ user: patientUser._id, status: 'PENDING' });
  assert.ok(pendingReq, 'PasswordResetRequest document must exist in DB');
  assert.strictEqual(pendingReq.status, 'PENDING');
  assert.strictEqual(pendingReq.requestedRole, 'PATIENT');
  console.log('✓ Enumeration-safe PENDING reset request creation verified');

  // 2. Duplicate PENDING Request Prevention
  const reqRes2 = createMockReqRes({ email: patientUser.email, role: 'PATIENT' });
  await forgotPassword(reqRes2.req, reqRes2.res, (err) => { if (err) throw err; });
  const pendingCount = await PasswordResetRequest.countDocuments({ user: patientUser._id, status: 'PENDING' });
  assert.strictEqual(pendingCount, 1, 'Duplicate PENDING requests must not be created');
  console.log('✓ Duplicate PENDING request prevention verified');

  // 3. Admin Listing & Pending Queue
  const reqRes3 = createMockReqRes({}, {}, { status: 'PENDING' }, adminUser1);
  await getPasswordRequests(reqRes3.req, reqRes3.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes3.getStatus(), 200);
  assert.ok(reqRes3.getData().data.length >= 1, 'Admin must see pending requests queue');
  console.log('✓ Admin pending requests queue fetch verified');

  // 4. Admin Approval & 6-Digit OTP Generation
  const reqRes4 = createMockReqRes({}, { id: pendingReq._id.toString() }, {}, adminUser1);
  await approvePasswordRequest(reqRes4.req, reqRes4.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes4.getStatus(), 200);
  assert.strictEqual(reqRes4.getData().data.status, 'APPROVED');

  const approvedDoc = await PasswordResetRequest.findById(pendingReq._id);
  assert.strictEqual(approvedDoc.status, 'APPROVED');
  assert.ok(approvedDoc.otpHash, 'otpHash must be set upon approval');
  assert.strictEqual(approvedDoc.otpHash.length, 64, 'SHA-256 hash length must be 64 characters');
  assert.ok(approvedDoc.otpExpires > new Date(), 'otpExpires must be unexpired 10-minute Date');
  console.log('✓ Admin approval & SHA-256 hashed 6-digit OTP generation verified');

  // 5. OTP Service Constant-Time Verification & Attempt Tracking
  const rawOtp = '482910';
  const hashedOtp = otpService.hashOtp(rawOtp);
  assert.strictEqual(otpService.compareOtp(rawOtp, hashedOtp), true, 'Valid OTP must compare true');
  assert.strictEqual(otpService.compareOtp('000000', hashedOtp), false, 'Invalid OTP must compare false');
  console.log('✓ OTP timingSafeEqual comparison service verified');

  // 6. Verification with Wrong OTP (Increment Attempts)
  approvedDoc.otpHash = hashedOtp;
  await approvedDoc.save();

  const reqRes5 = createMockReqRes({ requestId: approvedDoc._id.toString(), otp: '999999', newPassword: 'NewPassword123!' });
  await verifyOtp(reqRes5.req, reqRes5.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes5.getStatus(), 400, 'Invalid OTP must be rejected');

  const updatedDoc = await PasswordResetRequest.findById(approvedDoc._id);
  assert.strictEqual(updatedDoc.otpAttempts, 1, 'otpAttempts counter must increment on failed try');
  console.log('✓ Failed OTP attempt tracking verified');

  // 7. Brute-Force Lockout at > 5 Failed Attempts
  updatedDoc.otpAttempts = 5;
  await updatedDoc.save();

  const reqRes6 = createMockReqRes({ requestId: approvedDoc._id.toString(), otp: '999999', newPassword: 'NewPassword123!' });
  await verifyOtp(reqRes6.req, reqRes6.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes6.getStatus(), 400);
  assert.ok(reqRes6.getData().message.includes('Maximum verification attempts exceeded'), 'Must enforce lockout after 5 attempts');

  const lockedDoc = await PasswordResetRequest.findById(approvedDoc._id);
  assert.strictEqual(lockedDoc.status, 'EXPIRED', 'Status must transition to EXPIRED on lockout');
  console.log('✓ Brute-force attempt lockout (max 5) verified');

  // 8. Successful OTP Verification & Password Reset with Session Invalidation
  const validRequest = await PasswordResetRequest.create({
    user: patientUser._id,
    requestedRole: 'PATIENT',
    status: 'APPROVED',
    otpHash: hashedOtp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    otpAttempts: 0,
  });

  const initialTokenVersion = patientUser.tokenVersion || 0;

  const reqRes7 = createMockReqRes({ requestId: validRequest._id.toString(), otp: rawOtp, newPassword: 'BrandNewSecurePassword123!' });
  await verifyOtp(reqRes7.req, reqRes7.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes7.getStatus(), 200, 'Valid OTP reset must return 200 OK');

  const finalUser = await User.findById(patientUser._id);
  const isMatch = await finalUser.comparePassword('BrandNewSecurePassword123!');
  assert.strictEqual(isMatch, true, 'User password must be updated in DB');
  assert.strictEqual(finalUser.tokenVersion, initialTokenVersion + 1, 'tokenVersion MUST increment to invalidate prior sessions');

  const completedRequest = await PasswordResetRequest.findById(validRequest._id);
  assert.strictEqual(completedRequest.status, 'COMPLETED', 'Request status must transition to COMPLETED');
  console.log('✓ Successful OTP verification, password update & tokenVersion session invalidation verified');

  // 9. Admin Self-Approval Rule (Multiple Admins vs Single Admin Gap)
  const adminSelfReq = await PasswordResetRequest.create({
    user: adminUser1._id,
    requestedRole: 'ADMIN',
    status: 'PENDING',
  });

  const reqRes8 = createMockReqRes({}, { id: adminSelfReq._id.toString() }, {}, adminUser1);
  await approvePasswordRequest(reqRes8.req, reqRes8.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqRes8.getStatus(), 403, 'Admin self-approval must be forbidden when multiple admins exist');
  console.log('✓ Admin self-approval block (multi-admin rule) verified');

  // Clean up test records
  await PasswordResetRequest.deleteMany({ user: { $in: [patientUser._id, adminUser1._id, adminUser2._id] } });
  await User.deleteMany({ _id: { $in: [patientUser._id, adminUser1._id, adminUser2._id] } });

  console.log('✓ [PASS] All Admin-Approved OTP Password Reset Tests Passed Cleanly!');
};

module.exports = runPasswordRequestTests;

if (require.main === module) {
  const config = require('../config/env');
  mongoose
    .connect(config.MONGODB_URI)
    .then(() => runPasswordRequestTests())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
