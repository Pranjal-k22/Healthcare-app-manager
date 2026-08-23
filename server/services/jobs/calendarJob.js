const Appointment = require('../../models/Appointment');
const DoctorProfile = require('../../models/DoctorProfile');
const calendarService = require('../calendarService');
const config = require('../../config/env');

/**
 * Sync appointment creation to Google Calendar for patient and doctor (if connected)
 * @param {string} appointmentId
 * @returns {Promise<boolean>}
 */
const syncAppointmentCreated = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!appointment || appointment.status === 'CANCELLED') {
      return false;
    }

    if (!Array.isArray(appointment.calendarEvents)) {
      appointment.calendarEvents = [];
    }

    const doctorProfile = await DoctorProfile.findOne({ doctorId: appointment.doctorId._id }).lean();
    const clinicLocation = doctorProfile?.clinicAddress || doctorProfile?.clinicName || 'HealthPulse Medical Center';
    const timeZone = config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
    const tzOffset = (timeZone === 'Asia/Kolkata' || timeZone === 'IST') ? '+05:30' : (timeZone === 'UTC' ? 'Z' : '+05:30');
    const startDateTime = `${appointment.date}T${appointment.startTime}:00${tzOffset}`;
    const endDateTime = `${appointment.date}T${appointment.endTime}:00${tzOffset}`;

    const candidateUsers = [
      { userId: appointment.patientId._id.toString(), isDoctor: false },
      { userId: appointment.doctorId._id.toString(), isDoctor: true },
    ];

    let anySynced = false;

    for (const { userId, isDoctor } of candidateUsers) {
      const summary = isDoctor
        ? `Consultation: ${appointment.patientId.name}`
        : `Consultation with Dr. ${appointment.doctorId.name}`;

      const description = `HealthPulse Appointment Ref: ${appointment._id}\nDepartment/Reason: ${appointment.reason || 'General Medical Consultation'}`;

      const eventPayload = {
        summary,
        description,
        location: clinicLocation,
        startDateTime,
        endDateTime,
        timeZone,
      };

      // Check existing event entry
      const existingEntryIndex = appointment.calendarEvents.findIndex(
        (e) => e.userId.toString() === userId
      );

      const existingEventId = existingEntryIndex >= 0 ? appointment.calendarEvents[existingEntryIndex].eventId : null;

      if (existingEventId) {
        const updated = await calendarService.updateEvent(userId, existingEventId, eventPayload);
        if (updated) {
          appointment.calendarEvents[existingEntryIndex].syncStatus = 'SYNCED';
          anySynced = true;
          continue;
        }
      }

      // Create fresh event
      const eventId = await calendarService.createEvent(userId, eventPayload);
      if (eventId) {
        if (existingEntryIndex >= 0) {
          appointment.calendarEvents[existingEntryIndex].eventId = eventId;
          appointment.calendarEvents[existingEntryIndex].syncStatus = 'SYNCED';
        } else {
          appointment.calendarEvents.push({
            userId,
            eventId,
            syncStatus: 'SYNCED',
          });
        }
        anySynced = true;
      }
    }

    if (anySynced) {
      appointment.calendarSyncStatus = 'SYNCED';
    }
    await appointment.save();
    return anySynced;
  } catch (err) {
    console.error(`[CalendarJob] Failed to sync created appointment ${appointmentId}:`, err.message);
    return false;
  }
};

/**
 * Sync appointment reschedule to Google Calendar
 * @param {string} newAppointmentId
 * @param {string} [oldAppointmentId]
 * @returns {Promise<boolean>}
 */
const syncAppointmentRescheduled = async (newAppointmentId, oldAppointmentId) => {
  try {
    if (oldAppointmentId && oldAppointmentId !== newAppointmentId) {
      await syncAppointmentCancelled(oldAppointmentId);
    }
    return await syncAppointmentCreated(newAppointmentId);
  } catch (err) {
    console.error(`[CalendarJob] Failed to sync rescheduled appointment ${newAppointmentId}:`, err.message);
    return false;
  }
};

/**
 * Sync appointment cancellation to Google Calendar
 * @param {string} appointmentId
 * @returns {Promise<boolean>}
 */
const syncAppointmentCancelled = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || !appointment.calendarEvents || appointment.calendarEvents.length === 0) {
      return true;
    }

    for (const entry of appointment.calendarEvents) {
      if (entry.syncStatus === 'DELETED') continue;

      if (entry.eventId && entry.userId) {
        await calendarService.deleteEvent(entry.userId.toString(), entry.eventId);
        entry.syncStatus = 'DELETED';
      }
    }

    appointment.calendarSyncStatus = 'SYNCED';
    await appointment.save();
    return true;
  } catch (err) {
    console.error(`[CalendarJob] Failed to sync cancelled appointment ${appointmentId}:`, err.message);
    return false;
  }
};

/**
 * Queue and execute a background Google Calendar synchronization job
 * @param {string} jobType - 'CALENDAR_CREATE_EVENT' | 'CALENDAR_UPDATE_EVENT' | 'CALENDAR_DELETE_EVENT'
 * @param {object} payload - Job payload { appointmentId, newAppointmentId, oldAppointmentId }
 */
const queueCalendarJob = (jobType, payload) => {
  setImmediate(async () => {
    try {
      switch (jobType) {
        case 'CALENDAR_CREATE_EVENT':
          await syncAppointmentCreated(payload.appointmentId);
          break;
        case 'CALENDAR_UPDATE_EVENT':
          await syncAppointmentRescheduled(
            payload.newAppointmentId || payload.appointmentId,
            payload.oldAppointmentId
          );
          break;
        case 'CALENDAR_DELETE_EVENT':
          await syncAppointmentCancelled(payload.appointmentId);
          break;
        default:
          console.warn(`[CalendarJob] Unknown job type: ${jobType}`);
      }
    } catch (err) {
      console.warn(`[CalendarJob] Background job ${jobType} error:`, err.message);
    }
  });
};

module.exports = {
  syncAppointmentCreated,
  syncAppointmentRescheduled,
  syncAppointmentCancelled,
  queueCalendarJob,
};
