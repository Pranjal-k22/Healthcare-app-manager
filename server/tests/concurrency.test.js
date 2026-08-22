const assert = require('assert');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const { bookAppointment } = require('../services/appointmentService');

const runConcurrencyTests = async () => {
  console.log('\n--- [TEST SUITE 13] Concurrent Double-Booking Race Condition Simulation ---');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // 1. Setup Doctor in database
  const doctorUser = await User.create({
    name: 'Dr. Concurrency Tester',
    email: `dr.concurrency.${Date.now()}@healthpulse.com`,
    password: 'Password123!',
    role: 'DOCTOR',
  });

  await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'Concurrent Medicine',
    slotDuration: 30,
    isActive: true,
    isAvailable: true,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: null, end: null },
      sunday: { enabled: false, start: null, end: null },
    },
  });

  // Ensure compound partial unique index is synced on Appointment collection
  await Appointment.syncIndexes();

  // 2. Setup 10 test patients
  const patientUsers = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      User.create({
        name: `Patient ${i + 1}`,
        email: `patient.concurrency.${i + 1}.${Date.now()}@healthpulse.com`,
        password: 'Password123!',
        role: 'PATIENT',
      })
    )
  );

  // Pick a future Monday date
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + 30);
  while (targetDateObj.getDay() !== 1) {
    targetDateObj.setDate(targetDateObj.getDate() + 1);
  }
  const year = targetDateObj.getFullYear();
  const month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
  const day = String(targetDateObj.getDate()).padStart(2, '0');
  const testDate = `${year}-${month}-${day}`;
  const testTime = '10:00';

  // 3. Fire 10 simultaneous booking attempts for the exact same slot
  const bookingPromises = patientUsers.map((patient) => {
    return bookAppointment({
      patientId: patient._id,
      doctorId: doctorUser._id,
      date: testDate,
      startTime: testTime,
      reason: 'Concurrent booking test',
      symptoms: 'Mild headache',
    })
      .then((res) => ({ status: 201, data: res }))
      .catch((err) => ({ status: err.statusCode || 500, error: err.message }));
  });

  const results = await Promise.all(bookingPromises);
  if (results.some(r => r.status !== 201 && r.status !== 409)) {
    console.log('[Concurrency Test Debug Results]:', results);
  }

  const count201 = results.filter((r) => r.status === 201).length;
  const count409 = results.filter((r) => r.status === 409).length;
  const countOther = results.filter((r) => r.status !== 201 && r.status !== 409).length;

  // Cleanup created test records
  await Appointment.deleteMany({ doctorId: doctorUser._id });
  await DoctorProfile.deleteMany({ userId: doctorUser._id });
  await User.deleteMany({ _id: { $in: [doctorUser._id, ...patientUsers.map((p) => p._id)] } });

  assert.strictEqual(count201, 1, 'Exactly 1 concurrent request must succeed with 201');
  assert.strictEqual(count409, 9, 'Exactly 9 concurrent requests must be rejected with 409 Conflict');
  assert.strictEqual(countOther, 0, 'Zero requests should result in unexpected error codes');

  console.log(`✓ Concurrent race condition test passed: 1 Created (201), 9 Conflicts (409)`);
  console.log('✓ [PASS] All Concurrency & Double-Booking Safety Tests Passed!');
};

module.exports = runConcurrencyTests;
if (require.main === module) {
  runConcurrencyTests()
    .then(() => {
      mongoose.connection.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
