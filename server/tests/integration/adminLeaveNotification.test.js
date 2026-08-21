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
let patientA;
let patientB;
let tokenAdmin;
let tokenPatientA;
let tokenPatientB;

beforeAll(async () => {
  const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/healthpulse_test_slot_hold';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }

  await Appointment.init();
  await DoctorProfile.init();
  await User.init();

  await User.deleteMany({
    email: {
      $in: [
        'admin.leave.test@healthpulse.com',
        'doctor.leave.test@healthpulse.com',
        'patientA.leave.test@example.com',
        'patientB.leave.test@example.com',
      ],
    },
  });
  await Appointment.deleteMany({});
  await DoctorProfile.deleteMany({});

  adminUser = await User.create({
    name: 'Admin Supervisor',
    email: 'admin.leave.test@healthpulse.com',
    password: 'Password123!',
    role: 'ADMIN',
  });
  tokenAdmin = generateToken(adminUser._id, 'ADMIN');

  doctorUser = await User.create({
    name: 'Dr. Sarah Connor',
    email: 'doctor.leave.test@healthpulse.com',
    password: 'Password123!',
    role: 'DOCTOR',
  });

  doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'Neurology',
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
    name: 'Patient Alice Test',
    email: 'patientA.leave.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientA = generateToken(patientA._id, 'PATIENT');

  patientB = await User.create({
    name: 'Patient Bob Test',
    email: 'patientB.leave.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
  tokenPatientB = generateToken(patientB._id, 'PATIENT');
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

describe('Admin Doctor Leave Scheduling & Automatic Appointment Cancellation', () => {
  // Test Case 1: Conflicting appointments cancelled, cancellationReason: 'DOCTOR_LEAVE', email dispatched
  test('Admin schedules leave on date with 2 booked appointments -> cancels both, sets DOCTOR_LEAVE, dispatches emails', async () => {
    const leaveDate = '2026-10-20'; // Future Tuesday

    // 1. Create two BOOKED appointments
    const apptA = await Appointment.create({
      patientId: patientA._id,
      doctorId: doctorUser._id,
      date: leaveDate,
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
      reason: 'Migraine consultation',
    });

    const apptB = await Appointment.create({
      patientId: patientB._id,
      doctorId: doctorUser._id,
      date: leaveDate,
      startTime: '11:00',
      endTime: '11:30',
      status: 'BOOKED',
      reason: 'Follow-up consultation',
    });

    // Spy on emailService.sendEmail
    const emailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ messageId: 'mock-test-id' });

    // 2. Admin adds leave for this doctor on leaveDate
    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Attending Neurological Summit',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cancelledAppointmentsCount).toBe(2);
    expect(res.body.affectedPatientIds).toEqual(
      expect.arrayContaining([patientA._id.toString(), patientB._id.toString()])
    );

    // 3. Query DB directly to verify appointment statuses and cancellationReason
    const updatedA = await Appointment.findById(apptA._id);
    const updatedB = await Appointment.findById(apptB._id);

    expect(updatedA.status).toBe('CANCELLED');
    expect(updatedA.cancellationReason).toBe('DOCTOR_LEAVE');

    expect(updatedB.status).toBe('CANCELLED');
    expect(updatedB.cancellationReason).toBe('DOCTOR_LEAVE');

    // 4. Verify email dispatch was called for both affected patients
    expect(emailSpy).toHaveBeenCalled();
    const calledEmails = emailSpy.mock.calls.map((call) => call[0].to);
    expect(calledEmails).toContain(patientA.email);
    expect(calledEmails).toContain(patientB.email);
  });

  // Test Case 2: Zero conflicting appointments
  test('Admin schedules leave on date with 0 existing bookings -> cancelledAppointmentsCount is 0, no modifications', async () => {
    const leaveDate = '2026-10-21'; // Future Wednesday
    const emailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue({ messageId: 'mock-test-id' });

    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Personal day off',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cancelledAppointmentsCount).toBe(0);

    const appointmentsCount = await Appointment.countDocuments({ date: leaveDate });
    expect(appointmentsCount).toBe(0);
    expect(emailSpy).not.toHaveBeenCalled();
  });

  // Test Case 3: Email dispatch failure for Patient A does not abort cancellation of Patient B or leave creation
  test('Email dispatch error for one patient does not throw or abort leave creation / other patient cancellation', async () => {
    const leaveDate = '2026-10-22'; // Future Thursday

    const apptA = await Appointment.create({
      patientId: patientA._id,
      doctorId: doctorUser._id,
      date: leaveDate,
      startTime: '09:30',
      endTime: '10:00',
      status: 'BOOKED',
    });

    const apptB = await Appointment.create({
      patientId: patientB._id,
      doctorId: doctorUser._id,
      date: leaveDate,
      startTime: '14:00',
      endTime: '14:30',
      status: 'BOOKED',
    });

    // Mock sendEmail to throw error when sending to patientA, but succeed for patientB
    const emailSpy = jest.spyOn(emailService, 'sendEmail').mockImplementation((options) => {
      if (options.to === patientA.email) {
        return Promise.reject(new Error('SMTP Transport Connection Refused'));
      }
      return Promise.resolve({ messageId: 'mock-success-id' });
    });

    const res = await request(app)
      .post(`/api/doctors/${doctorProfile._id}/leave`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        date: leaveDate,
        reason: 'Emergency Leave',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cancelledAppointmentsCount).toBe(2);

    // Both appointments must still be CANCELLED with DOCTOR_LEAVE in DB
    const updatedA = await Appointment.findById(apptA._id);
    const updatedB = await Appointment.findById(apptB._id);

    expect(updatedA.status).toBe('CANCELLED');
    expect(updatedA.cancellationReason).toBe('DOCTOR_LEAVE');
    expect(updatedB.status).toBe('CANCELLED');
    expect(updatedB.cancellationReason).toBe('DOCTOR_LEAVE');

    // Doctor leave is persisted in DoctorLeave collection
    const createdLeave = await DoctorLeave.findOne({
      doctorId: doctorUser._id,
      startDate: leaveDate,
      status: 'APPROVED',
    });
    expect(createdLeave).toBeDefined();
  });
});
