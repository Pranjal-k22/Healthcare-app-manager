const MedicationReminder = require('../../models/MedicationReminder');
const { Notification } = require('../../models/Notification');
const { sendEmail } = require('../email/emailService');
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

        // 2. Send Optional Email Notification
        if (config.ENABLE_EMAIL_NOTIFICATIONS && reminder.patientId.email) {
          sendEmail({
            to: reminder.patientId.email,
            subject: `Medication Reminder: ${reminder.medicineName} (${reminder.dosage})`,
            text: `Hello ${reminder.patientId.name},\n\nThis is a reminder to take your prescribed dose of ${reminder.medicineName} (${reminder.dosage}) at ${reminder.scheduledTime}.\nInstructions: ${reminder.instructions}\n\nStay healthy,\nHealthPulse Clinic`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #0ea5e9;">Medication Dose Reminder</h2>
                <p>Hello <strong>${reminder.patientId.name}</strong>,</p>
                <p>It is time to take your prescribed medication:</p>
                <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px; margin: 15px 0;">
                  <h3 style="margin: 0 0 5px 0; color: #0f172a;">${reminder.medicineName}</h3>
                  <p style="margin: 3px 0;"><strong>Dosage:</strong> ${reminder.dosage}</p>
                  <p style="margin: 3px 0;"><strong>Scheduled Time:</strong> ${reminder.scheduledTime}</p>
                  <p style="margin: 3px 0;"><strong>Doctor Instructions:</strong> ${reminder.instructions}</p>
                </div>
                <p style="font-size: 12px; color: #64748b;">Prescribed by Dr. ${reminder.doctorId?.name || 'Practitioner'}</p>
              </div>
            `,
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
