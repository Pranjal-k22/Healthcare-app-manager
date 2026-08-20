const {
  syncAppointmentCreated,
  syncAppointmentRescheduled,
  syncAppointmentCancelled,
} = require('../google/googleCalendarService');

/**
 * Queue and execute a background Google Calendar synchronization job
 * @param {string} jobType - 'CALENDAR_CREATE_EVENT' | 'CALENDAR_UPDATE_EVENT' | 'CALENDAR_DELETE_EVENT'
 * @param {object} payload - Job payload { appointmentId, newAppointmentId, oldAppointmentId, userId }
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 */
const queueCalendarJob = (jobType, payload, maxRetries = 3) => {
  // Execute asynchronously in background (Non-blocking)
  setImmediate(async () => {
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      try {
        console.log(`[CalendarJob] Executing ${jobType} (Attempt ${attempt}/${maxRetries})`);

        switch (jobType) {
          case 'CALENDAR_CREATE_EVENT':
            success = await syncAppointmentCreated(payload.appointmentId, payload.userId);
            break;
          case 'CALENDAR_UPDATE_EVENT':
            success = await syncAppointmentRescheduled(
              payload.newAppointmentId || payload.appointmentId,
              payload.oldAppointmentId
            );
            break;
          case 'CALENDAR_DELETE_EVENT':
            success = await syncAppointmentCancelled(payload.appointmentId);
            break;
          default:
            console.warn(`[CalendarJob] Unknown job type: ${jobType}`);
            return;
        }

        if (success) {
          console.log(`[CalendarJob] ${jobType} completed successfully.`);
        } else {
          // If not successful and not yet at max retries, backoff
          if (attempt < maxRetries) {
            await new Promise((res) => setTimeout(res, attempt * 500));
          }
        }
      } catch (error) {
        console.error(
          `[CalendarJob] ${jobType} attempt ${attempt} error:`,
          error.message
        );
        if (attempt < maxRetries) {
          await new Promise((res) => setTimeout(res, attempt * 500));
        }
      }
    }

    if (!success) {
      console.warn(
        `[CalendarJob] ${jobType} completed with no active calendar synced or retries exhausted.`
      );
    }
  });
};

module.exports = {
  queueCalendarJob,
};
