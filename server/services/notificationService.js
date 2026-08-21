const mongoose = require('mongoose');
const { Notification } = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./email/emailService');
const {
  buildAppointmentBookedEmail,
  buildAppointmentCancelledEmail,
  buildAppointmentRescheduledEmail,
  buildAppointmentReminderEmail,
  buildPrescriptionAvailableEmail,
} = require('./email/emailTemplates');

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
 * Mark a single notification as read (with user ownership check)
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

  return notification;
};

/**
 * Mark all unread notifications for a user as read
 * @param {string} userId
 * @returns {Promise<number>} - Count of updated notifications
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
    const doctorName = doctor.name;
    const date = appointment.date;
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_BOOKED',
      title: 'Appointment Confirmed',
      message: `Your consultation with ${doctorName} is confirmed for ${date} at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName, date, startTime, endTime },
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

    // 3. Asynchronous Emails
    const patientMail = buildAppointmentBookedEmail({
      recipientName: patientName,
      doctorName,
      patientName,
      date,
      startTime,
      endTime,
      isDoctor: false,
    });
    emailService.sendEmail({ to: patient.email, ...patientMail }).catch(() => {});

    const doctorMail = buildAppointmentBookedEmail({
      recipientName: doctorName,
      doctorName,
      patientName,
      date,
      startTime,
      endTime,
      isDoctor: true,
    });
    emailService.sendEmail({ to: doctor.email, ...doctorMail }).catch(() => {});
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

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `Your consultation with ${doctor.name} on ${date} at ${startTime} has been cancelled.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName: doctor.name, date, startTime },
    });

    // 2. In-App Notification for Doctor
    await createNotification({
      userId: doctor._id,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `The consultation with ${patient.name} on ${date} at ${startTime} was cancelled.`,
      relatedAppointmentId: appointment._id,
      metadata: { patientName: patient.name, date, startTime },
    });

    // 3. Asynchronous Emails
    const patientMail = buildAppointmentCancelledEmail({
      recipientName: patient.name,
      date,
      startTime,
      isDoctor: false,
      otherPartyName: doctor.name,
    });
    emailService.sendEmail({ to: patient.email, ...patientMail }).catch(() => {});

    const doctorMail = buildAppointmentCancelledEmail({
      recipientName: doctor.name,
      date,
      startTime,
      isDoctor: true,
      otherPartyName: patient.name,
    });
    emailService.sendEmail({ to: doctor.email, ...doctorMail }).catch(() => {});
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
      message: `Your consultation with ${doctor.name} has been moved to ${date} at ${startTime}–${endTime}.`,
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

    // 3. Asynchronous Emails
    const patientMail = buildAppointmentRescheduledEmail({
      recipientName: patient.name,
      otherPartyName: doctor.name,
      isDoctor: false,
      date,
      startTime,
      endTime,
    });
    emailService.sendEmail({ to: patient.email, ...patientMail }).catch(() => {});

    const doctorMail = buildAppointmentRescheduledEmail({
      recipientName: doctor.name,
      otherPartyName: patient.name,
      isDoctor: true,
      date,
      startTime,
      endTime,
    });
    emailService.sendEmail({ to: doctor.email, ...doctorMail }).catch(() => {});
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

    const date = appointment?.date || 'recent consultation';
    const startTime = appointment?.startTime || '';

    // 1. In-App Notification for Patient
    await createNotification({
      userId: patient._id,
      type: 'PRESCRIPTION_AVAILABLE',
      title: 'Prescription Issued',
      message: `Dr. ${doctor.name} has issued your medical prescription. You can view your medication schedule in your portal.`,
      relatedAppointmentId: prescription.appointmentId,
      metadata: { doctorName: doctor.name, prescriptionId: prescription._id },
    });

    // 2. Asynchronous Email for Patient
    const patientMail = buildPrescriptionAvailableEmail({
      patientName: patient.name,
      doctorName: doctor.name,
      date,
      startTime,
    });
    emailService.sendEmail({ to: patient.email, ...patientMail }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchPrescriptionAvailable:', error.message);
  }
};

/**
 * Dispatch upcoming appointment reminder (called by background job)
 * @param {object} appointment
 */
const dispatchAppointmentReminder = async (appointment) => {
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
      message: `Reminder: You have a consultation with ${doctor.name} scheduled today at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { doctorName: doctor.name, date, startTime, endTime },
    });

    // 2. In-App Notification for Doctor
    await createNotification({
      userId: doctor._id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Consultation Reminder',
      message: `Reminder: Consultation with ${patient.name} scheduled today at ${startTime}–${endTime}.`,
      relatedAppointmentId: appointment._id,
      metadata: { patientName: patient.name, date, startTime, endTime },
    });

    // 3. Asynchronous Emails
    const patientMail = buildAppointmentReminderEmail({
      recipientName: patient.name,
      otherPartyName: doctor.name,
      isDoctor: false,
      date,
      startTime,
      endTime,
    });
    emailService.sendEmail({ to: patient.email, ...patientMail }).catch(() => {});

    const doctorMail = buildAppointmentReminderEmail({
      recipientName: doctor.name,
      otherPartyName: patient.name,
      isDoctor: true,
      date,
      startTime,
      endTime,
    });
    emailService.sendEmail({ to: doctor.email, ...doctorMail }).catch(() => {});
  } catch (error) {
    console.error('[NotificationService] Error in dispatchAppointmentReminder:', error.message);
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
};
