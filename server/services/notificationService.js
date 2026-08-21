const mongoose = require('mongoose');
const { Notification } = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');
const emailTemplates = require('./emailTemplates');

/**
 * Create a persistent in-app notification
 * @param {object} params - { userId, type, title, message, relatedAppointmentId, metadata }
 * @returns {Promise<object>}
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedAppointmentId = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedAppointmentId,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create in-app notification:', error.message);
    return null;
  }
};

/**
 * Get user's notifications with pagination & read status filter
 * @param {string} userId
 * @param {object} options - { isRead, limit, page }
 * @returns {Promise<object>}
 */
const getUserNotifications = async (userId, options = {}) => {
  const { isRead, limit = 50, page = 1 } = options;

  const query = { userId };
  if (isRead !== undefined) {
    query.isRead = isRead === 'true' || isRead === true;
  }

  const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * numericLimit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .populate('relatedAppointmentId', 'date startTime endTime status reason')
      .lean(),
    Notification.countDocuments(query),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      relatedAppointmentId: n.relatedAppointmentId,
      isRead: n.isRead,
      metadata: n.metadata,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    total,
    page: parseInt(page, 10) || 1,
    limit: numericLimit,
  };
};

/**
 * Get count of unread notifications for a user
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    userId,
    isRead: false,
  });
  return count;
};

/**
 * Mark a single notification as read
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error('Invalid Notification ID');
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });

  if (!notification) {
    const error = new Error('Notification not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  notification.isRead = true;
  await notification.save();

  return {
    id: notification._id.toString(),
    isRead: true,
  };
};

/**
 * Mark all notifications for a user as read
 * @param {string} userId
 * @returns {Promise<number>} Number of updated documents
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return result.modifiedCount;
};

/**
 * Delete a notification
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error('Invalid Notification ID');
    error.statusCode = 400;
    throw error;
  }

  const result = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });

  if (!result) {
    const error = new Error('Notification not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

// ============================================================
// Asynchronous Event Dispatchers (Non-Blocking)
// ============================================================

/**
 * Dispatch notifications when an appointment is booked
 * @param {object} appointment - Populated or raw appointment document
 */
const dispatchAppointmentBooked = async (appointment) => {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(appointment.patientId).select('name email'),
      User.findById(appointment.doctorId).select('name email'),
    ]);

    if (!patient || !doctor) return;

    const patientName = patient.name;
    const cleanDoctorName = doctor.name.replace(/^Dr\.?\s+/i, '').trim();
    const doctorDisplay = `Dr. ${cleanDoctorName}`;
    const date = appointment.date;
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;
    const fee = appointment.fee || 75;

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_BOOKED',
      title: 'Appointment Confirmed',
      message: `Your consultation with ${doctorDisplay} is confirmed for ${date} at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName: cleanDoctorName, date, startTime, endTime, fee },
    });

    // 2. In-App Notification for Doctor
    await createNotification({
      userId: doctor._id,
      type: 'APPOINTMENT_BOOKED',
      title: 'New Consultation Booked',
      message: `New appointment scheduled with ${patientName} on ${date} at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { patientName, date, startTime, endTime },
    });

    // 3. Branded Emails (Patient & Doctor)
    const patientPayload = {
      recipientName: patientName,
      recipientRole: 'PATIENT',
      doctorName: doctorDisplay,
      patientName,
      specialisation: 'Specialist Physician',
      date,
      time: `${startTime}–${endTime}`,
      fee,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    const patientMail = emailTemplates.bookingConfirmation(patientPayload);
    emailService.sendEmail({
      to: patient.email,
      ...patientMail,
      appointmentId: appointment._id,
      notificationType: 'bookingConfirmation',
      payload: patientPayload,
    }).catch(() => {});

    const doctorPayload = {
      recipientName: doctorDisplay,
      recipientRole: 'DOCTOR',
      doctorName: cleanDoctorName,
      patientName,
      specialisation: 'Specialist Physician',
      date,
      time: `${startTime}–${endTime}`,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    const doctorMail = emailTemplates.bookingConfirmation(doctorPayload);
    emailService.sendEmail({
      to: doctor.email,
      ...doctorMail,
      appointmentId: appointment._id,
      notificationType: 'bookingConfirmation',
      payload: doctorPayload,
    }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchAppointmentBooked:', error.message);
  }
};

/**
 * Dispatch notifications when an appointment is cancelled
 * @param {object} appointment
 * @param {object} cancelledByUser - User who triggered the cancellation
 */
const dispatchAppointmentCancelled = async (appointment, cancelledByUser = {}) => {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(appointment.patientId).select('name email'),
      User.findById(appointment.doctorId).select('name email'),
    ]);

    if (!patient || !doctor) return;

    const date = appointment.date;
    const startTime = appointment.startTime;
    const reason = appointment.reason || 'Cancelled by user request';

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `Your consultation with Dr. ${doctor.name} on ${date} at ${startTime} has been cancelled.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName: doctor.name, date, startTime, reason },
    });

    // 2. In-App Notification for Doctor
    await createNotification({
      userId: doctor._id,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `The consultation with ${patient.name} on ${date} at ${startTime} was cancelled.`,
      relatedAppointmentId: appointment._id,
      metadata: { patientName: patient.name, date, startTime, reason },
    });

    // 3. Asynchronous Emails
    const patientPayload = {
      recipientName: patient.name,
      recipientRole: 'PATIENT',
      doctorName: doctor.name,
      patientName: patient.name,
      date,
      time: startTime,
      reason,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    const patientMail = emailTemplates.appointmentCancellation(patientPayload);
    emailService.sendEmail({
      to: patient.email,
      ...patientMail,
      appointmentId: appointment._id,
      notificationType: 'appointmentCancellation',
      payload: patientPayload,
    }).catch(() => {});

    const doctorPayload = {
      recipientName: `Dr. ${doctor.name}`,
      recipientRole: 'DOCTOR',
      doctorName: doctor.name,
      patientName: patient.name,
      date,
      time: startTime,
      reason,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    const doctorMail = emailTemplates.appointmentCancellation(doctorPayload);
    emailService.sendEmail({
      to: doctor.email,
      ...doctorMail,
      appointmentId: appointment._id,
      notificationType: 'appointmentCancellation',
      payload: doctorPayload,
    }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchAppointmentCancelled:', error.message);
  }
};

/**
 * Dispatch notifications when an appointment is rescheduled
 * @param {object} newAppointment
 * @param {object} oldAppointment
 */
const dispatchAppointmentRescheduled = async (newAppointment, oldAppointment) => {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(newAppointment.patientId).select('name email'),
      User.findById(newAppointment.doctorId).select('name email'),
    ]);

    if (!patient || !doctor) return;

    const date = newAppointment.date;
    const startTime = newAppointment.startTime;
    const endTime = newAppointment.endTime;

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_RESCHEDULED',
      title: 'Appointment Rescheduled',
      message: `Your consultation with Dr. ${doctor.name} has been moved to ${date} at ${startTime}–${endTime}.`,
      relatedAppointmentId: newAppointment._id,
      metadata: { doctorName: doctor.name, date, startTime, endTime },
    });

    // 2. In-App Notification for Doctor
    await createNotification({
      userId: doctor._id,
      type: 'APPOINTMENT_RESCHEDULED',
      title: 'Consultation Rescheduled',
      message: `Consultation with ${patient.name} has been rescheduled to ${date} at ${startTime}–${endTime}.`,
      relatedAppointmentId: newAppointment._id,
      metadata: { patientName: patient.name, date, startTime, endTime },
    });

    // 3. Emails: cancellation of old slot + confirmation of new slot
    if (oldAppointment) {
      const cancelPayload = {
        recipientName: patient.name,
        recipientRole: 'PATIENT',
        doctorName: doctor.name,
        patientName: patient.name,
        date: oldAppointment.date,
        time: oldAppointment.startTime,
        reason: 'Rescheduled to new time slot',
      };
      const cancelMail = emailTemplates.appointmentCancellation(cancelPayload);
      emailService.sendEmail({
        to: patient.email,
        ...cancelMail,
        appointmentId: oldAppointment._id,
        notificationType: 'appointmentCancellation',
        payload: cancelPayload,
      }).catch(() => {});
    }

    const bookingPayload = {
      recipientName: patient.name,
      recipientRole: 'PATIENT',
      doctorName: doctor.name,
      patientName: patient.name,
      specialisation: 'Specialist Physician',
      date,
      time: `${startTime}–${endTime}`,
      appointmentId: newAppointment._id ? newAppointment._id.toString() : '',
    };
    const confirmMail = emailTemplates.bookingConfirmation(bookingPayload);
    emailService.sendEmail({
      to: patient.email,
      ...confirmMail,
      appointmentId: newAppointment._id,
      notificationType: 'bookingConfirmation',
      payload: bookingPayload,
    }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchAppointmentRescheduled:', error.message);
  }
};

/**
 * Dispatch notification when doctor creates/finalizes a prescription
 * @param {object} prescription
 * @param {object} appointment
 */
const dispatchPrescriptionAvailable = async (prescription, appointment) => {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(prescription.patientId).select('name email'),
      User.findById(prescription.doctorId).select('name email'),
    ]);

    if (!patient || !doctor) return;

    // In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'PRESCRIPTION_AVAILABLE',
      title: 'Prescription Issued',
      message: `Dr. ${doctor.name} has issued your medical prescription. You can view your medication schedule in your portal.`,
      relatedAppointmentId: prescription.appointmentId,
      metadata: { doctorName: doctor.name, prescriptionId: prescription._id },
    });
  } catch (error) {
    console.error('[NotificationService] Error in dispatchPrescriptionAvailable:', error.message);
  }
};

/**
 * Dispatch upcoming appointment reminder (called by background job)
 * @param {object} appointment
 * @param {number} [hoursUntil=24]
 */
const dispatchAppointmentReminder = async (appointment, hoursUntil = 24) => {
  try {
    const [patient, doctor] = await Promise.all([
      User.findById(appointment.patientId).select('name email'),
      User.findById(appointment.doctorId).select('name email'),
    ]);

    if (!patient || !doctor) return;

    const date = appointment.date;
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Consultation Reminder',
      message: `Reminder: You have a consultation with Dr. ${doctor.name} scheduled ${hoursUntil <= 1 ? 'in 1 hour' : 'tomorrow'} at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName: doctor.name, date, startTime, endTime, hoursUntil },
    });

    // 2. Email Reminder to Patient
    const reminderPayload = {
      recipientName: patient.name,
      doctorName: doctor.name,
      patientName: patient.name,
      date,
      time: `${startTime}–${endTime}`,
      hoursUntil,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    const reminderMail = emailTemplates.appointmentReminder(reminderPayload);
    emailService.sendEmail({
      to: patient.email,
      ...reminderMail,
      appointmentId: appointment._id,
      notificationType: 'appointmentReminder',
      payload: reminderPayload,
    }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchAppointmentReminder:', error.message);
  }
};

/**
 * Dispatch Doctor Leave Conflict email to affected patient
 * @param {object} params - { patientEmail, patientName, doctorName, date, time, rescheduleLink }
 */
const dispatchDoctorLeaveConflict = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  time,
  rescheduleLink = '/patient/doctors',
}) => {
  try {
    const payload = { patientName, doctorName, date, time, rescheduleLink };
    const mail = emailTemplates.doctorLeaveConflict(payload);
    await emailService.sendEmail({
      to: patientEmail,
      ...mail,
      notificationType: 'doctorLeaveConflict',
      payload,
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorLeaveConflict:', err.message);
  }
};

/**
 * Dispatch Medication Reminder email
 * @param {object} params - { patientEmail, patientName, medicationName, dosage, doseTime, instructions }
 */
const dispatchMedicationReminder = async ({
  patientEmail,
  patientName,
  medicationName,
  dosage,
  doseTime,
  instructions,
}) => {
  try {
    const payload = { patientName, medicationName, dosage, doseTime, instructions };
    const mail = emailTemplates.medicationReminder(payload);
    await emailService.sendEmail({
      to: patientEmail,
      ...mail,
      notificationType: 'medicationReminder',
      payload,
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchMedicationReminder:', err.message);
  }
};

/**
 * Dispatch Password Changed Security Alert email
 * @param {object} user - { email, name }
 */
const dispatchPasswordChangedAlert = async (user) => {
  try {
    const payload = { recipientName: user.name || 'User' };
    const mail = emailTemplates.passwordChanged(payload);
    await emailService.sendEmail({
      to: user.email,
      ...mail,
      notificationType: 'passwordChanged',
      payload,
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchPasswordChangedAlert:', err.message);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  dispatchAppointmentBooked,
  dispatchAppointmentCancelled,
  dispatchAppointmentRescheduled,
  dispatchPrescriptionAvailable,
  dispatchAppointmentReminder,
  dispatchDoctorLeaveConflict,
  dispatchMedicationReminder,
  dispatchPasswordChangedAlert,
};
