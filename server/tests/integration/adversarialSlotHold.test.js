const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const Appointment = require('../../models/Appointment');
const SlotHold = require('../../models/SlotHold');
const generateToken = require('../../utils/generateToken');

jest.setTimeout(60000);

let doctorUser;
let doctorProfile;
let patientA;
let patientB;
let patientC;
let tokenPatientA;
let tokenPatientB;
let tokenPatientC;

beforeAll(async () => {
  const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/healthpulse_test_slot_hold';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }

  await Appointment.init();
  await SlotHold.init();
  await DoctorProfile.init();
  await User.init();

  await User.deleteMany({ email: { $in: ['doc.adv@healthpulse.com', 'pA.adv@test.com', 'pB.adv@test.com', 'pC.adv@test.com'] } });
  await Appointment.deleteMany({});
  await SlotHold.deleteMany({});

  doctorUser = await User.create({
    name: 'Dr. Adversarial Doctor',
    email: 'doc.adv@healthpulse.com',
    password: 'Password123!',
    role: 'DOCTOR',
  });

  doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'Cardiology',
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

  patientA = await User.create({
    name: 'Patient A',
    email: 'pA.adv@test.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientA = generateToken(patientA._id, 'PATIENT');

  patientB = await User.create({
    name: 'Patient B',
    email: 'pB.adv@test.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientB = generateToken(patientB._id, 'PATIENT');

  patientC = await User.create({
    name: 'Patient C',
    email: 'pC.adv@test.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientC = generateToken(patientC._id, 'PATIENT');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Appointment.deleteMany({});
    await SlotHold.deleteMany({});
  }
});

describe('Adversarial Hold Bypass & 3-Way Race Conditions', () => {
  test('Patient A holds slot 10:00, then books a DIFFERENT slot 11:00 simultaneously while Patient B tries to hold/book 10:00 -> Patient B is rejected for 10:00', async () => {
    const date = '2026-09-15';

    // 1. Patient A holds 10:00 slot
    const holdResA = await request(app)
      .post('/api/appointments/hold-slot')
      .set('Authorization', `Bearer ${tokenPatientA}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date,
        startTime: '10:00',
      });

    expect(holdResA.status).toBe(201);

    // 2. Concurrently: Patient A books 11:00, while Patient B attempts to hold/book Patient A's held 10:00 slot
    const [bookResA_differentSlot, holdResB_heldSlot] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${tokenPatientA}`)
        .send({
          doctorId: doctorUser._id.toString(),
          date,
          startTime: '11:00',
          reason: 'Checkup on 11:00',
          symptoms: 'Fever',
        }),
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientB}`)
        .send({
          doctorId: doctorUser._id.toString(),
          date,
          startTime: '10:00',
        }),
    ]);

    // Patient A succeeds on 11:00 booking
    expect(bookResA_differentSlot.status).toBe(201);

    // Patient B is REJECTED (409) because Patient A still holds 10:00
    expect(holdResB_heldSlot.status).toBe(409);
    expect(holdResB_heldSlot.body.message).toMatch(/currently held by another patient/i);

    // Patient B tries directly booking 10:00 without hold -> also rejected because hold is active for Patient A
    const bookResB_heldSlot = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${tokenPatientB}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date,
        startTime: '10:00',
        reason: 'Attempting to steal slot',
        symptoms: 'Cough',
      });

    expect(bookResB_heldSlot.status).toBe(409);
  });

  test('THREE simultaneous hold requests for the same slot from 3 different patients: exactly 1 succeeds (201), 2 fail (409), exactly 1 hold in DB', async () => {
    const date = '2026-09-15';
    const startTime = '14:00';

    const payload = {
      doctorId: doctorUser._id.toString(),
      date,
      startTime,
    };

    const [resA, resB, resC] = await Promise.all([
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientA}`)
        .send(payload),
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientB}`)
        .send(payload),
      request(app)
        .post('/api/appointments/hold-slot')
        .set('Authorization', `Bearer ${tokenPatientC}`)
        .send(payload),
    ]);

    const statuses = [resA.status, resB.status, resC.status].sort();
    expect(statuses).toEqual([201, 409, 409]);

    // Query real database for active holds
    const holdsInDb = await SlotHold.find({
      doctorId: doctorUser._id,
      date,
      startTime,
    });

    expect(holdsInDb.length).toBe(1);
    expect([patientA._id.toString(), patientB._id.toString(), patientC._id.toString()]).toContain(
      holdsInDb[0].patientId.toString()
    );
  });
});
