const mongoose = require('mongoose');
const { google } = require('googleapis');
const User = require('../../models/User');
const DoctorProfile = require('../../models/DoctorProfile');
const Appointment = require('../../models/Appointment');
const CalendarConnection = require('../../models/CalendarConnection');
const {
  syncAppointmentCreated,
  syncAppointmentCancelled,
  syncAppointmentRescheduled,
} = require('../../services/google/googleCalendarService');

jest.setTimeout(60000);

let doctorUser;
let doctorProfile;
let patientUser;
let patientUserB;

beforeAll(async () => {
  const testDbUri =
    process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/healthpulse_test_slot_hold';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testDbUri);
  }

  await Appointment.init();
  await DoctorProfile.init();
  await CalendarConnection.init();
  await User.init();

  await User.deleteMany({
    email: {
      $in: [
        'doc.calendar.test@healthpulse.com',
        'pat.calendar.test@example.com',
        'patB.calendar.test@example.com',
      ],
    },
  });
  await Appointment.deleteMany({});
  await DoctorProfile.deleteMany({});
  await CalendarConnection.deleteMany({});

  doctorUser = await User.create({
    name: 'Dr. Gregory House',
    email: 'doc.calendar.test@healthpulse.com',
    password: 'Password123!',
    role: 'DOCTOR',
  });

  doctorProfile = await DoctorProfile.create({
    userId: doctorUser._id,
    specialization: 'Diagnostic Medicine',
    slotDuration: 30,
    isActive: true,
    isAvailable: true,
    clinicName: 'Princeton-Plainsboro Clinic',
    clinicAddress: '123 Medical Center Way',
  });

  patientUser = await User.create({
    name: 'John Doe',
    email: 'pat.calendar.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });

  patientUserB = await User.create({
    name: 'Jane Smith',
    email: 'patB.calendar.test@example.com',
    password: 'Password123!',
    role: 'PATIENT',
  });
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
    await CalendarConnection.deleteMany({});
  }
});

describe('Google Calendar Dual-Event Sync & Overwrite Prevention', () => {
  // Test 1: Both doctor and patient connected -> 2 distinct event IDs created and stored without overwrite
  test('Doctor and Patient both connected -> creates 2 distinct events in calendarEvents array without overwriting', async () => {
    // Seed connections for both doctor and patient
    await CalendarConnection.create({
      userId: doctorUser._id,
      googleAccountEmail: 'doc.google@gmail.com',
      accessToken: 'mock-doc-access-token',
      refreshToken: 'mock-doc-refresh-token',
      isConnected: true,
    });

    await CalendarConnection.create({
      userId: patientUser._id,
      googleAccountEmail: 'pat.google@gmail.com',
      accessToken: 'mock-pat-access-token',
      refreshToken: 'mock-pat-refresh-token',
      isConnected: true,
    });

    const appointment = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      date: '2026-11-10',
      startTime: '10:00',
      endTime: '10:30',
      status: 'BOOKED',
    });

    // Mock Google Calendar API insert
    let callCount = 0;
    const insertMock = jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        data: {
          id: callCount === 1 ? 'event-doctor-sync-101' : 'event-patient-sync-202',
        },
      });
    });

    jest.spyOn(google, 'calendar').mockReturnValue({
      events: {
        insert: insertMock,
        update: jest.fn().mockResolvedValue({ data: { id: 'mock-updated-id' } }),
        delete: jest.fn().mockResolvedValue({}),
      },
    });

    const synced = await syncAppointmentCreated(appointment._id.toString());
    expect(synced).toBe(true);

    const updatedAppt = await Appointment.findById(appointment._id);
    expect(updatedAppt.calendarSyncStatus).toBe('SYNCED');
    expect(updatedAppt.calendarEvents).toHaveLength(2);

    const docEvent = updatedAppt.calendarEvents.find(
      (e) => e.userId.toString() === doctorUser._id.toString()
    );
    const patEvent = updatedAppt.calendarEvents.find(
      (e) => e.userId.toString() === patientUser._id.toString()
    );

    expect(docEvent).toBeDefined();
    expect(docEvent.eventId).toBe('event-doctor-sync-101');
    expect(docEvent.syncStatus).toBe('SYNCED');

    expect(patEvent).toBeDefined();
    expect(patEvent.eventId).toBe('event-patient-sync-202');
    expect(patEvent.syncStatus).toBe('SYNCED');

    // Confirm neither overwrote the other
    expect(docEvent.eventId).not.toEqual(patEvent.eventId);
  });

  // Test 2: syncAppointmentCancelled deletes both events from distinct calendars
  test('syncAppointmentCancelled deletes both events with distinct event IDs and marks both DELETED', async () => {
    await CalendarConnection.create({
      userId: doctorUser._id,
      accessToken: 'mock-doc-token',
      isConnected: true,
    });
    await CalendarConnection.create({
      userId: patientUser._id,
      accessToken: 'mock-pat-token',
      isConnected: true,
    });

    const appointment = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      date: '2026-11-10',
      startTime: '10:00',
      endTime: '10:30',
      status: 'CANCELLED',
      calendarEvents: [
        {
          userId: doctorUser._id,
          eventId: 'event-doctor-sync-101',
          syncStatus: 'SYNCED',
        },
        {
          userId: patientUser._id,
          eventId: 'event-patient-sync-202',
          syncStatus: 'SYNCED',
        },
      ],
      calendarSyncStatus: 'SYNCED',
    });

    const deleteMock = jest.fn().mockResolvedValue({});
    jest.spyOn(google, 'calendar').mockReturnValue({
      events: {
        delete: deleteMock,
      },
    });

    const result = await syncAppointmentCancelled(appointment._id.toString());
    expect(result).toBe(true);

    // Delete should be called exactly twice
    expect(deleteMock).toHaveBeenCalledTimes(2);
    const deletedEventIds = deleteMock.mock.calls.map((c) => c[0].eventId);
    expect(deletedEventIds).toContain('event-doctor-sync-101');
    expect(deletedEventIds).toContain('event-patient-sync-202');

    const updatedAppt = await Appointment.findById(appointment._id);
    expect(updatedAppt.calendarEvents[0].syncStatus).toBe('DELETED');
    expect(updatedAppt.calendarEvents[1].syncStatus).toBe('DELETED');
  });

  // Test 3: Failure resilience — one deletion failure does not block the other
  test('Failure resilience: error deleting doctor event does not block patient deletion', async () => {
    await CalendarConnection.create({
      userId: doctorUser._id,
      accessToken: 'mock-doc-token',
      isConnected: true,
    });
    await CalendarConnection.create({
      userId: patientUser._id,
      accessToken: 'mock-pat-token',
      isConnected: true,
    });

    const appointment = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      date: '2026-11-10',
      startTime: '14:00',
      endTime: '14:30',
      status: 'CANCELLED',
      calendarEvents: [
        {
          userId: doctorUser._id,
          eventId: 'event-doc-fail-999',
          syncStatus: 'SYNCED',
        },
        {
          userId: patientUser._id,
          eventId: 'event-pat-ok-888',
          syncStatus: 'SYNCED',
        },
      ],
      calendarSyncStatus: 'SYNCED',
    });

    const deleteMock = jest.fn().mockImplementation((params) => {
      if (params.eventId === 'event-doc-fail-999') {
        const error = new Error('OAuth Token Expired');
        error.code = 401;
        return Promise.reject(error);
      }
      return Promise.resolve({});
    });

    jest.spyOn(google, 'calendar').mockReturnValue({
      events: {
        delete: deleteMock,
      },
    });

    const result = await syncAppointmentCancelled(appointment._id.toString());
    expect(result).toBe(true);

    const updatedAppt = await Appointment.findById(appointment._id);
    const docEntry = updatedAppt.calendarEvents.find(
      (e) => e.userId.toString() === doctorUser._id.toString()
    );
    const patEntry = updatedAppt.calendarEvents.find(
      (e) => e.userId.toString() === patientUser._id.toString()
    );

    expect(docEntry.syncStatus).toBe('FAILED');
    expect(patEntry.syncStatus).toBe('DELETED');
  });

  // Test 4: Single connected user — only patient connected
  test('Single connected user: only patient has CalendarConnection -> exactly 1 entry created without errors', async () => {
    // Only patient connected
    await CalendarConnection.create({
      userId: patientUserB._id,
      accessToken: 'mock-patB-token',
      isConnected: true,
    });

    const appointment = await Appointment.create({
      patientId: patientUserB._id,
      doctorId: doctorUser._id,
      date: '2026-11-12',
      startTime: '15:00',
      endTime: '15:30',
      status: 'BOOKED',
    });

    const insertMock = jest.fn().mockResolvedValue({
      data: { id: 'event-single-patient-303' },
    });

    jest.spyOn(google, 'calendar').mockReturnValue({
      events: {
        insert: insertMock,
      },
    });

    const synced = await syncAppointmentCreated(appointment._id.toString());
    expect(synced).toBe(true);

    const updatedAppt = await Appointment.findById(appointment._id);
    expect(updatedAppt.calendarEvents).toHaveLength(1);
    expect(updatedAppt.calendarEvents[0].userId.toString()).toBe(patientUserB._id.toString());
    expect(updatedAppt.calendarEvents[0].eventId).toBe('event-single-patient-303');
    expect(updatedAppt.calendarEvents[0].syncStatus).toBe('SYNCED');
  });
});
