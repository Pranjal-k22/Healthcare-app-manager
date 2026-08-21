const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const Appointment = require('../../models/Appointment');
const SlotHold = require('../../models/SlotHold');
const generateToken = require('../../utils/generateToken');

jest.setTimeout(180000);

let mongoServer;
let doctorUser;
let doctorProfile;
let patientA;
let patientB;
let tokenPatientA;
let tokenPatientB;

beforeAll(async () => {
  const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/healthpulse_test_slot_hold';
  try {
    await mongoose.connect(testDbUri);
  } catch (err) {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  }

  // Ensure compound unique indexes are built
  await Appointment.init();
  await SlotHold.init();
  await DoctorProfile.init();
  await User.init();

  // Clean initial state
  await User.deleteMany({ email: { $in: ['doctor.hold.test@healthpulse.com', 'alice.hold.test@example.com', 'bob.hold.test@example.com'] } });
  await DoctorProfile.deleteMany({});
  await Appointment.deleteMany({});
  await SlotHold.deleteMany({});

  // Create Doctor
  doctorUser = await User.create({
    name: 'Dr. John Doe',
    email: 'doctor.hold.test@healthpulse.com',
    password: 'Password123!',
    role: 'DOCTOR',
  });

  doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'General Medicine',
    slotDuration: 30,
    isActive: true,
    isAvailable: true,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
    },
  });

  // Create Patients
  patientA = await User.create({
    name: 'Patient Alice',
    email: 'alice.hold.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientA = generateToken(patientA._id, 'PATIENT');

  patientB = await User.create({
    name: 'Patient Bob',
    email: 'bob.hold.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientB = generateToken(patientB._id, 'PATIENT');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Appointment.deleteMany({});
    await SlotHold.deleteMany({});
  }
});

describe('Slot Hold & Concurrency Protection Integration Suite', () => {
  // Test 1: Near-simultaneous hold-slot requests for the same slot
  test('Two near-simultaneous POST /api/appointments/hold-slot requests from different patients: exactly one 201, one 409', async () => {
    const holdPayload = {
      doctorId: doctorUser._id.toString(),
      date: '2026-09-15', // A Tuesday
      startTime: '10:00',
    };

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientA}`)
        .send(holdPayload),
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientB}`)
        .send(holdPayload),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);

    const successRes = resA.status === 201 ? resA : resB;
    const conflictRes = resA.status === 409 ? resA : resB;

    expect(successRes.body.success).toBe(true);
    expect(successRes.body.data.expiresAt).toBeDefined();
    expect(conflictRes.body.success).toBe(false);
    expect(conflictRes.body.message).toMatch(/currently held by another patient/i);
  });

  // Test 2: Near-simultaneous raw booking requests without holding (testing raw index-level protection)
  test('Two near-simultaneous POST /api/appointments requests for the same slot without prior hold: exactly one 201, one 409, exactly 1 DB record', async () => {
    const bookingPayload = {
      doctorId: doctorUser._id.toString(),
      date: '2026-09-15',
      startTime: '11:00',
      reason: 'Routine Consultation',
      symptoms: 'Mild headache',
    };

    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${tokenPatientA}`)
        .send(bookingPayload),
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${tokenPatientB}`)
        .send(bookingPayload),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);

    const appointmentsInDb = await Appointment.find({
      doctorId: doctorUser._id,
      date: '2026-09-15',
      startTime: '11:00',
      status: { $in: ['BOOKED', 'COMPLETED'] },
    });

    expect(appointmentsInDb.length).toBe(1);
  });

  // Test 3: Hold expiration allows another patient to hold/book
  test('Patient holds slot, hold expires, different patient can successfully hold and book the slot', async () => {
    const date = '2026-09-15';
    const startTime = '14:00';

    // 1. Patient A holds the slot with an expired timestamp (simulating expired hold)
    await SlotHold.create({
      doctorId: doctorUser._id,
      date,
      startTime,
      patientId: patientA._id,
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    });

    // 2. Patient B now requests to hold the same slot
    const holdResB = await request(app)
      .post('/api/appointments/hold-slot')
      .set('Authorization', `Bearer ${tokenPatientB}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date,
        startTime,
      });

    expect(holdResB.status).toBe(201);
    expect(holdResB.body.success).toBe(true);

    // 3. Patient B proceeds to book the slot
    const bookResB = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatientB}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date,
        startTime,
        reason: 'Follow-up visit',
        symptoms: 'Checkup',
      });

    expect(bookResB.status).toBe(201);
    expect(bookResB.body.success).toBe(true);

    // 4. Verify holds are cleaned up upon successful booking
    const remainingHolds = await SlotHold.find({
      doctorId: doctorUser._id,
      date,
      startTime,
    });
    expect(remainingHolds.length).toBe(0);
  });
});
