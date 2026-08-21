const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const DoctorLeave = require('../../models/DoctorLeave');
const Appointment = require('../../models/Appointment');
const emailService = require('../../services/email/emailService');
const generateToken = require('../../utils/generateToken');

jest.setTimeout(60000);

let adminUser;
let doctorUser;
let doctorProfile;
let patientUser;
let tokenAdmin;
let tokenPatient;

beforeAll(async () => {
  const testDbUri =
    process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/healthpulse_test_slot_hold';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }

  await Appointment.init();
  await DoctorProfile.init();
  await DoctorLeave.init();
  await User.init();

  await User.deleteMany({
    email: {
      $in: [
        'admin.migration.test@healthpulse.com',
        'doc.migration.test@healthpulse.com',
        'pat.migration.test@example.com',
      ],
    },
  });
  await Appointment.deleteMany({});
  await DoctorProfile.deleteMany({});
  await DoctorLeave.deleteMany({});

  adminUser = await User.create({
    name: 'Admin Director',
    email: 'admin.migration.test@healthpulse.com',
    password: 'Password123!',
    role: 'ADMIN',
  });
  tokenAdmin = generateToken(adminUser._id, 'ADMIN');

  doctorUser = await User.create({
    name: 'Dr. John Watson',
    email: 'doc.migration.test@healthpulse.com',
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
    leaves: [],
  });

  patientUser = await User.create({
    name: 'Sherlock Holmes',
    email: 'pat.migration.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatient = generateToken(patientUser._id, 'PATIENT');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  jest.restoreAllMocks();
  if (mongoose.connection.readyState === 1) {
    await Appointment.deleteMany({});
    await DoctorLeave.deleteMany({});
    if (doctorProfile) {
      doctorProfile.leaves = [];
      await doctorProfile.save();
    }
  }
});

describe('Doctor Leave Schema Migration (DoctorProfile.leaves -> DoctorLeave)', () => {
  // Test 1: Admin creates leave -> DoctorLeave document created with startDate === endDate === date, DoctorProfile.leaves untouched
  test('Admin creates single-date leave -> creates DoctorLeave record, leaves DoctorProfile.leaves empty', async () => {
    const leaveDate = '2026-11-17'; // Future Tuesday

    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Annual Medical Conference',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Assert DoctorLeave document in dedicated collection
    const createdLeave = await DoctorLeave.findOne({
      doctorId: doctorUser._id,
      startDate: leaveDate,
    });
    expect(createdLeave).toBeDefined();
    expect(createdLeave.startDate).toBe(leaveDate);
    expect(createdLeave.endDate).toBe(leaveDate);
    expect(createdLeave.status).toBe('APPROVED');
    expect(createdLeave.reason).toBe('Annual Medical Conference');

    // Assert DoctorProfile.leaves is NOT modified (remains empty)
    const updatedProfile = await DoctorProfile.findById(doctorProfile._id);
    expect(updatedProfile.leaves).toHaveLength(0);
  });

  // Test 2: Pre-existing BOOKED appointment is cancelled with DOCTOR_LEAVE and email dispatched (Task 2 regression check)
  test('Creating leave on date with booked appointment cancels appointment with DOCTOR_LEAVE & dispatches notification', async () => {
    const leaveDate = '2026-11-18'; // Future Wednesday

    const appt = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      date: leaveDate,
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
      reason: 'Checkup',
    });

    const emailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ messageId: 'mock-test-id' });

    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Emergency Maintenance',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cancelledAppointmentsCount).toBe(1);

    const updatedAppt = await Appointment.findById(appt._id);
    expect(updatedAppt.status).toBe('CANCELLED');
    expect(updatedAppt.cancellationReason).toBe('DOCTOR_LEAVE');

    expect(emailSpy).toHaveBeenCalled();
    const calledEmails = emailSpy.mock.calls.map((c) => c[0].to);
    expect(calledEmails).toContain(patientUser.email);
  });

  // Test 3: Slot availability (GET /api/appointments/slots/:doctorId/:date) returns empty on DoctorLeave date
  test('Slot availability returns 0 available slots on date covered by DoctorLeave', async () => {
    const leaveDate = '2026-11-19'; // Future Thursday

    // Create leave in DoctorLeave
    await DoctorLeave.create({
      doctorId: doctorUser._id,
      startDate: leaveDate,
      endDate: leaveDate,
      reason: 'Clinical Research Day',
      status: 'APPROVED',
    });

    const res = await request(app)
      .get(`/api/appointments/slots/${doctorUser._id}/${leaveDate}`)
      .set('Authorization', `Bearer ${tokenPatient}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  // Test 4: Task 1 POST /api/appointments/hold-slot rejects holding a slot on DoctorLeave date
  test('POST /api/appointments/hold-slot rejects holding a slot on a DoctorLeave date with 400', async () => {
    const leaveDate = '2026-11-20'; // Future Friday

    await DoctorLeave.create({
      doctorId: doctorUser._id,
      startDate: leaveDate,
      endDate: leaveDate,
      reason: 'Personal Leave',
      status: 'APPROVED',
    });

    const res = await request(app)
      .post('/api/appointments/hold-slot')
      .set('Authorization', `Bearer ${tokenPatient}`)
      .send({
        doctorId: doctorUser._id.toString(),
        date: leaveDate,
        startTime: '10:00',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/leave/i);
  });

  // Test 5: Attempting to create a duplicate leave returns 409 Conflict
  test('Creating duplicate leave on same date returns 409 Conflict via DoctorLeave duplicate check', async () => {
    const leaveDate = '2026-11-24'; // Future Tuesday

    await DoctorLeave.create({
      doctorId: doctorUser._id,
      startDate: leaveDate,
      endDate: leaveDate,
      reason: 'Special Leave',
      status: 'APPROVED',
    });

    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Duplicate Request Attempt',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already has a scheduled leave/i);
  });
});
