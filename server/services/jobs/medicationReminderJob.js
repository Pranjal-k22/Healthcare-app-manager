const MedicationReminder = require('../../models/MedicationReminder');
const { Notification } = require('../../models/Notification');
const emailService = require('../email/emailService');
const config = require('../../config/env');

let medicationJobTimer = null;
let isProcessingMedication = false;

/**
 * Process due medication reminders
 */
const processDueMedicationReminders = async () => {
  if (isProcessingMedication) return;
  isProcessingMedication = true;

  try {
    const now = new Date();
    // Query due reminders that are still PENDING
    const dueReminders = await MedicationReminder.find({
      status: 'PENDING',
      scheduledDateTime: { $lte: now },
    })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .limit(50);

    for (const reminder of dueReminders) {
      try {
        if (!reminder.patientId) {
          reminder.status = 'CANCELLED';
          await reminder.save();
          continue;
        }

        // 1. Create In-App Notification
        const notification = await Notification.create({
          userId: reminder.patientId._id,
          type: 'MEDICATION_REMINDER',
          title: `Medication Reminder: ${reminder.medicineName} (${reminder.dosage})`,
          message: `Time to take your scheduled dose of ${reminder.medicineName} (${reminder.dosage}). Instructions: ${reminder.instructions}`,
          relatedAppointmentId: reminder.appointmentId,
          isRead: false,
          metadata: {
            reminderId: reminder._id,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage,
            instructions: reminder.instructions,
            scheduledTime: reminder.scheduledTime,
          },
        });

        // 2. Send On-Brand Email Notification
        if (reminder.patientId.email) {
          const emailTemplates = require('../emailTemplates');
          const payload = {
            patientName: reminder.patientId.name,
            medicationName: reminder.medicineName,
            dosage: reminder.dosage,
            doseTime: reminder.scheduledTime,
            instructions: reminder.instructions,
          };
          const rendered = emailTemplates.medicationReminder(payload);
          emailService.sendEmail({
            to: reminder.patientId.email,
            ...rendered,
            appointmentId: reminder.appointmentId,
            notificationType: 'medicationReminder',
            payload,
            recipientName: reminder.patientId.name,
          }).catch((err) => {
            console.error('[MedicationJob] Email dispatch failed:', err.message);
          });
        }

        // 3. Atomically update reminder status to SENT
        reminder.status = 'SENT';
        reminder.notificationSentAt = new Date();
        reminder.notificationId = notification._id;
        await reminder.save();

        console.log(
          `[MedicationJob] Sent reminder for ${reminder.medicineName} (${reminder.dosage}) to patient ${reminder.patientId.name}`
        );
      } catch (itemErr) {
        console.error(
          `[MedicationJob] Error processing reminder ${reminder._id}:`,
          itemErr.message
        );
      }
    }
  } catch (err) {
    console.error('[MedicationJob] Error in reminder loop:', err.message);
  } finally {
    isProcessingMedication = false;
  }
};

/**
 * Start background medication reminder scheduler
 */
const startMedicationReminderJob = () => {
  if (medicationJobTimer) {
    return;
  }

  console.log('[MedicationJob] Starting background medication reminder worker (every 60s)...');
  processDueMedicationReminders(); // Initial check
  medicationJobTimer = setInterval(processDueMedicationReminders, 60000);
};

/**
 * Stop background medication reminder scheduler
 */
const stopMedicationReminderJob = () => {
  if (medicationJobTimer) {
    clearInterval(medicationJobTimer);
    medicationJobTimer = null;
    console.log('[MedicationJob] Background medication reminder worker stopped.');
  }
};

module.exports = {
  processDueMedicationReminders,
  startMedicationReminderJob,
  stopMedicationReminderJob,
};
