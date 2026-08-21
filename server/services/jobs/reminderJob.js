const Appointment = require('../../models/Appointment');
const { Notification } = require('../../models/Notification');
const { dispatchAppointmentReminder } = require('../notificationService');
const { timeToMinutes } = require('../../validators/appointmentValidator');
const config = require('../../config/env');

let reminderTimer = null;
let isJobRunning = false;

/**
 * Check and process upcoming appointment reminders (24h and 1h windows)
 */
const processUpcomingReminders = async () => {
  if (isJobRunning) {
    return; // Prevent overlapping executions
  }

  isJobRunning = true;

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const reminderWindowMinutes = config.APPOINTMENT_REMINDER_MINUTES || 60;

    // 1. Process 1-Hour Reminders (Today's upcoming appointments)
    const todayAppointments = await Appointment.find({
      date: todayStr,
      status: 'BOOKED',
    }).lean();

    for (const appointment of todayAppointments) {
      const slotStartMinutes = timeToMinutes(appointment.startTime);
      const minutesUntilSlot = slotStartMinutes - currentMinutes;

      // Check if appointment is within the 1-hour reminder window
      if (minutesUntilSlot > 0 && minutesUntilSlot <= reminderWindowMinutes) {
        const alreadyNotified1h = await Notification.exists({
          relatedAppointmentId: appointment._id,
          type: 'APPOINTMENT_REMINDER',
          'metadata.hoursUntil': 1,
        });

        if (!alreadyNotified1h) {
          console.log(
            `[ReminderJob] Triggering 1-hour reminder for Appointment ID ${appointment._id} (${minutesUntilSlot}m before ${appointment.startTime})`
          );
          await dispatchAppointmentReminder(appointment, 1);
        }
      }
    }

    // 2. Process 24-Hour Reminders (Tomorrow's appointments)
    const tomorrowAppointments = await Appointment.find({
      date: tomorrowStr,
      status: 'BOOKED',
    }).lean();

    for (const appointment of tomorrowAppointments) {
      const alreadyNotified24h = await Notification.exists({
        relatedAppointmentId: appointment._id,
        type: 'APPOINTMENT_REMINDER',
        'metadata.hoursUntil': 24,
      });

      if (!alreadyNotified24h) {
        console.log(
          `[ReminderJob] Triggering 24-hour advance reminder for Appointment ID ${appointment._id} on ${tomorrowStr}`
        );
        await dispatchAppointmentReminder(appointment, 24);
      }
    }
  } catch (error) {
    console.error('[ReminderJob] Error processing upcoming reminders:', error.message);
  } finally {
    isJobRunning = false;
  }
};

/**
 * Start the background reminder scheduler safely
 */
const startReminderJob = () => {
  if (reminderTimer) {
    console.log('[ReminderJob] Scheduler is already active.');
    return;
  }

  console.log(
    `[ReminderJob] Starting background reminder job (Interval: ${config.REMINDER_JOB_INTERVAL_MS}ms, Window: ${config.APPOINTMENT_REMINDER_MINUTES}m)`
  );

  // Initial check on startup
  processUpcomingReminders().catch(() => {});

  // Periodic interval
  reminderTimer = setInterval(() => {
    processUpcomingReminders().catch(() => {});
  }, config.REMINDER_JOB_INTERVAL_MS);
};

/**
 * Stop the background reminder scheduler (for graceful shutdown)
 */
const stopReminderJob = () => {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
    console.log('[ReminderJob] Reminder scheduler stopped.');
  }
};

module.exports = {
  processUpcomingReminders,
  startReminderJob,
  stopReminderJob,
};
