const Appointment = require('../../models/Appointment');
const { Notification } = require('../../models/Notification');
const { dispatchAppointmentReminder } = require('../notificationService');
const { timeToMinutes } = require('../../validators/appointmentValidator');
const config = require('../../config/env');

let reminderTimer = null;
let isJobRunning = false;

/**
 * Check and process upcoming appointment reminders
 */
const processUpcomingReminders = async () => {
  if (isJobRunning) {
    return; // Prevent overlapping executions
  }

  isJobRunning = true;

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const reminderWindowMinutes = config.APPOINTMENT_REMINDER_MINUTES;

    // Find all active booked appointments scheduled for today
    const upcomingAppointments = await Appointment.find({
      date: todayStr,
      status: 'BOOKED',
    }).lean();

    for (const appointment of upcomingAppointments) {
      const slotStartMinutes = timeToMinutes(appointment.startTime);
      const minutesUntilSlot = slotStartMinutes - currentMinutes;

      // Check if appointment is within the reminder window (e.g. within next 60 minutes and hasn't started yet)
      if (minutesUntilSlot > 0 && minutesUntilSlot <= reminderWindowMinutes) {
        // Check for duplicate reminder
        const alreadyNotified = await Notification.exists({
          relatedAppointmentId: appointment._id,
          type: 'APPOINTMENT_REMINDER',
        });

        if (!alreadyNotified) {
          console.log(
            `[ReminderJob] Triggering reminder for Appointment ID ${appointment._id} (${minutesUntilSlot}m before ${appointment.startTime})`
          );
          await dispatchAppointmentReminder(appointment);
        }
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
