const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

const runApiTests = async () => {
  console.log('\n--- [TEST SUITE 14] Supertest HTTP REST API Endpoints ---');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  // Setup test users & doctor profile
  const testEmail = `supertest.patient.${Date.now()}@healthpulse.com`;
  const docEmail = `supertest.doc.${Date.now()}@healthpulse.com`;
  const testPassword = 'Password123!';

  const patient = await User.create({
    name: 'Supertest Patient',
    email: testEmail,
    password: testPassword,
    role: 'PATIENT',
  });

  const doctorUser = await User.create({
    name: 'Dr. Supertest Specialist',
    email: docEmail,
    password: testPassword,
    role: 'DOCTOR',
  });

  await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'Cardiology',
    slotDuration: 30,
    isActive: true,
    isAvailable: true,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: true, start: '09:00', end: '17:00' },
      sunday: { enabled: true, start: '09:00', end: '17:00' },
    },
  });

  // 1. POST /api/auth/login
  console.log('Testing POST /api/auth/login...');
  
  // 1a. Missing fields -> 400
  const missingRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail });
  if (missingRes.status !== 400) {
    throw new Error(`Expected 400 for missing fields, got ${missingRes.status}`);
  }

  // 1b. Invalid credentials -> 401
  const invalidRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail, password: 'WrongPassword!' });
  if (invalidRes.status !== 401) {
    throw new Error(`Expected 401 for invalid password, got ${invalidRes.status}`);
  }

  // 1c. Valid credentials -> 200 + token
  const validRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testEmail, password: testPassword });
  if (validRes.status !== 200 || !validRes.body.token) {
    throw new Error(`Expected 200 + token for valid login, got ${validRes.status}`);
  }
  const token = validRes.body.token;
  console.log('✓ POST /api/auth/login endpoints verified');

  // 2. GET /api/doctors
  console.log('Testing GET /api/doctors...');
  
  // 2a. Unauthenticated -> 401
  const unauthDocRes = await request(app).get('/api/doctors');
  if (unauthDocRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated GET /api/doctors, got ${unauthDocRes.status}`);
  }

  // 2b. Authenticated -> 200
  const doctorsRes = await request(app)
    .get('/api/doctors')
    .set('Authorization', `Bearer ${token}`);
  if (doctorsRes.status !== 200 || !Array.isArray(doctorsRes.body.data || doctorsRes.body)) {
    throw new Error(`Expected 200 + array for GET /api/doctors, got ${doctorsRes.status}`);
  }
  console.log('✓ GET /api/doctors verified (401 unauthenticated & 200 authenticated)');

  // 3. GET /api/appointments/my
  console.log('Testing GET /api/appointments/my...');
  
  // 3a. Unauthenticated -> 401
  const unauthRes = await request(app).get('/api/appointments/my');
  if (unauthRes.status !== 401) {
    throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  }

  // 3b. Authenticated -> 200
  const authApptsRes = await request(app)
    .get('/api/appointments/my')
    .set('Authorization', `Bearer ${token}`);
  if (authApptsRes.status !== 200) {
    throw new Error(`Expected 200 for authenticated appointments list, got ${authApptsRes.status}`);
  }
  console.log('✓ GET /api/appointments/my verified');

  // 4. POST /api/appointments
  console.log('Testing POST /api/appointments...');
  const futureDate = '2026-12-15';
  const startTime = '11:00';

  // 4a. Invalid doctor/date -> 400
  const invalidBookingRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send({ doctorId: 'invalid-id', date: futureDate, startTime });
  if (invalidBookingRes.status !== 400) {
    throw new Error(`Expected 400 for invalid doctorId, got ${invalidBookingRes.status}`);
  }

  // 4b. Valid booking -> 201
  const bookingPayload = {
    doctorId: doctorUser._id.toString(),
    date: futureDate,
    startTime,
    symptoms: 'Routine checkup for testing',
  };
  const bookRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(bookingPayload);
  if (bookRes.status !== 201) {
    throw new Error(`Expected 201 for valid booking, got ${bookRes.status}: ${JSON.stringify(bookRes.body)}`);
  }

  // 4c. Double-booking same slot -> 409 conflict
  const doubleBookRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${token}`)
    .send(bookingPayload);
  if (doubleBookRes.status !== 409) {
    throw new Error(`Expected 409 conflict for double-booking, got ${doubleBookRes.status}`);
  }
  console.log('✓ POST /api/appointments verified (201 created & 409 double-booking conflict)');

  console.log('✓ [PASS] All Supertest HTTP REST Integration Tests Passed!');
};

if (require.main === module) {
  runApiTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ API Test Failed:', err);
      process.exit(1);
    });
}

module.exports = runApiTests;
