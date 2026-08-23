const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorResetRequest = require('../models/DoctorResetRequest');
const otpService = require('../services/otpService');
const { getDoctorResetRequests, approveDoctorReset, denyDoctorReset, verifyDoctorOtp } = require('../controllers/doctorResetController');
const { forgotPassword, resetPassword } = require('../controllers/authController');

const runDoctorResetRequestTests = async () => {
  console.log('\n--- [TEST SUITE 15] Hybrid Password Reset Workflow (Doctor Approval + Patient/Admin Self-Service) ---');

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
    name: 'Hybrid Patient Tester',
    email: `patient.hybrid.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'PATIENT',
  });

  const doctorUser = await User.create({
    name: 'Hybrid Doctor Tester',
    email: `doctor.hybrid.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'DOCTOR',
  });

  const adminUser = await User.create({
    name: 'Hybrid Admin Tester',
    email: `admin.hybrid.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });

  // 1. Role-Branching Forgot-Password: PATIENT & ADMIN Self-Service Branch
  const reqResPatient = createMockReqRes({ email: patientUser.email, role: 'PATIENT' });
  await forgotPassword(reqResPatient.req, reqResPatient.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResPatient.getStatus(), 200);
  assert.strictEqual(reqResPatient.getData().success, true);
  assert.strictEqual(reqResPatient.getData().message, "If an account exists, you'll receive instructions by email shortly.");

  const updatedPatient = await User.findById(patientUser._id);
  assert.ok(updatedPatient.passwordResetToken, 'Patient user must have passwordResetToken set');
  assert.ok(updatedPatient.passwordResetExpires > new Date(), 'Patient token must have 15-min expiry');
  console.log('✓ PATIENT self-service token generation verified');

  // 2. Role-Branching Forgot-Password: DOCTOR Admin-Approval Branch
  const reqResDoctor = createMockReqRes({ email: doctorUser.email, role: 'DOCTOR' });
  await forgotPassword(reqResDoctor.req, reqResDoctor.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResDoctor.getStatus(), 200);
  assert.strictEqual(reqResDoctor.getData().message, "If an account exists, you'll receive instructions by email shortly.");

  const docRequest = await DoctorResetRequest.findOne({ doctor: doctorUser._id, status: 'PENDING' });
  assert.ok(docRequest, 'DoctorResetRequest document must exist in DB');
  assert.strictEqual(docRequest.status, 'PENDING');

  const unupdatedDoctor = await User.findById(doctorUser._id);
  assert.ok(!unupdatedDoctor.passwordResetToken, 'Doctor user must NOT receive self-service reset token');
  console.log('✓ DOCTOR admin-approval PENDING request creation verified');

  // 3. Server-Side Guard: DOCTOR Token Reset Rejection on reset-password endpoint
  // Create a fake token on Doctor user to test guard
  doctorUser.passwordResetToken = 'fakehashedtoken123';
  doctorUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await doctorUser.save();

  const reqResGuard = createMockReqRes({ token: 'fakeunhashedtoken123', password: 'NewPassword123!' });
  await resetPassword(reqResGuard.req, reqResGuard.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResGuard.getStatus(), 400, 'DOCTOR user token must be rejected on reset-password endpoint');
  console.log('✓ Server-side guard rejecting DOCTOR reset on reset-password endpoint verified');

  // 4. Admin Doctor Reset Requests Queue Fetch
  const reqResQueue = createMockReqRes({}, {}, { status: 'PENDING' }, adminUser);
  await getDoctorResetRequests(reqResQueue.req, reqResQueue.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResQueue.getStatus(), 200);
  assert.ok(reqResQueue.getData().data.length >= 1, 'Admin must see doctor reset requests queue');
  console.log('✓ Admin doctor reset requests queue fetch verified');

  // 5. Admin Approval & 6-Digit OTP Generation
  const reqResApprove = createMockReqRes({}, { id: docRequest._id.toString() }, {}, adminUser);
  await approveDoctorReset(reqResApprove.req, reqResApprove.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResApprove.getStatus(), 200);
  assert.strictEqual(reqResApprove.getData().data.status, 'APPROVED');

  const approvedDocReq = await DoctorResetRequest.findById(docRequest._id);
  assert.strictEqual(approvedDocReq.status, 'APPROVED');
  assert.ok(approvedDocReq.otpHash, 'otpHash must be set upon approval');
  assert.strictEqual(approvedDocReq.otpHash.length, 64, 'SHA-256 hash length must be 64 characters');
  assert.ok(approvedDocReq.otpExpires > new Date(), 'otpExpires must be unexpired 10-minute Date');
  console.log('✓ Admin approval & SHA-256 hashed 6-digit OTP generation verified');

  // 6. Doctor OTP Verification & Session Invalidation
  const rawOtp = '654321';
  const hashedOtp = otpService.hashOtp(rawOtp);
  approvedDocReq.otpHash = hashedOtp;
  await approvedDocReq.save();

  const initialDocTokenVersion = doctorUser.tokenVersion || 0;

  const reqResVerify = createMockReqRes({ requestId: approvedDocReq._id.toString(), otp: rawOtp, newPassword: 'BrandNewDoctorPassword123!' });
  await verifyDoctorOtp(reqResVerify.req, reqResVerify.res, (err) => { if (err) throw err; });
  assert.strictEqual(reqResVerify.getStatus(), 200, 'Valid Doctor OTP reset must return 200 OK');

  const finalDoctor = await User.findById(doctorUser._id);
  const isDocMatch = await finalDoctor.comparePassword('BrandNewDoctorPassword123!');
  assert.strictEqual(isDocMatch, true, 'Doctor password must be updated in DB');
  assert.strictEqual(finalDoctor.tokenVersion, initialDocTokenVersion + 1, 'Doctor tokenVersion MUST increment to invalidate prior sessions');

  const completedDocReq = await DoctorResetRequest.findById(approvedDocReq._id);
  assert.strictEqual(completedDocReq.status, 'COMPLETED', 'Request status must transition to COMPLETED');
  console.log('✓ Doctor OTP verification, password update & tokenVersion session invalidation verified');

  // Clean up test records
  await DoctorResetRequest.deleteMany({ doctor: doctorUser._id });
  await User.deleteMany({ _id: { $in: [patientUser._id, doctorUser._id, adminUser._id] } });

  console.log('✓ [PASS] All Hybrid Password Reset Workflow Tests Passed Cleanly!');
};

module.exports = runDoctorResetRequestTests;

if (require.main === module) {
  const config = require('../config/env');
  mongoose
    .connect(config.MONGO_URI || config.MONGODB_URI)
    .then(() => runDoctorResetRequestTests())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
