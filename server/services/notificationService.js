const mongoose = require('mongoose');
const { Notification } = require('../models/Notification');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const emailService = require('./emailService');
const emailTemplates = require('./emailTemplates');
const { queueEmailNotification } = require('./queue/emailQueue');

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

    // 3. Queue Branded Emails (Patient & Doctor)
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
    queueEmailNotification({
      to: patient.email,
      recipientName: patientName,
      templateName: 'bookingConfirmation',
      templateData: patientPayload,
      appointmentId: appointment._id,
      notificationType: 'BOOKING_CONFIRMATION',
    });

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
    queueEmailNotification({
      to: doctor.email,
      recipientName: doctorDisplay,
      templateName: 'bookingConfirmation',
      templateData: doctorPayload,
      appointmentId: appointment._id,
      notificationType: 'BOOKING_CONFIRMATION',
    });
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

    // 3. Queue Asynchronous Emails
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
    queueEmailNotification({
      to: patient.email,
      recipientName: patient.name,
      templateName: 'appointmentCancellation',
      templateData: patientPayload,
      appointmentId: appointment._id,
      notificationType: 'APPOINTMENT_CANCELLATION',
    });

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
    queueEmailNotification({
      to: doctor.email,
      recipientName: `Dr. ${doctor.name}`,
      templateName: 'appointmentCancellation',
      templateData: doctorPayload,
      appointmentId: appointment._id,
      notificationType: 'APPOINTMENT_CANCELLATION',
    });
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

    // 3. Queue Emails
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
    queueEmailNotification({
      to: patient.email,
      recipientName: patient.name,
      templateName: 'bookingConfirmation',
      templateData: bookingPayload,
      appointmentId: newAppointment._id,
      notificationType: 'APPOINTMENT_RESCHEDULED',
    });

    const docReschedulePayload = {
      recipientName: `Dr. ${doctor.name}`,
      recipientRole: 'DOCTOR',
      doctorName: doctor.name,
      patientName: patient.name,
      specialisation: 'Specialist Physician',
      date,
      time: `${startTime}–${endTime}`,
      appointmentId: newAppointment._id ? newAppointment._id.toString() : '',
    };
    queueEmailNotification({
      to: doctor.email,
      recipientName: `Dr. ${doctor.name}`,
      templateName: 'bookingConfirmation',
      templateData: docReschedulePayload,
      appointmentId: newAppointment._id,
      notificationType: 'APPOINTMENT_RESCHEDULED',
    });
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

    // Transactional Hospital Email to Patient with Prescribed Medicines
    if (patient.email) {
      let specialisation = 'General Practice';
      const doctorProfile = await DoctorProfile.findOne({
        $or: [{ userId: doctor._id }, { doctorId: doctor._id }],
      }).select('specialization specialisation');
      if (doctorProfile) {
        specialisation = doctorProfile.specialization || doctorProfile.specialisation || 'General Practice';
      }

      await queueEmailNotification({
        to: patient.email,
        recipientName: patient.name,
        templateName: 'prescriptionIssued',
        templateData: {
          recipientName: patient.name,
          doctorName: doctor.name,
          specialisation,
          medicines: prescription.medicines || [],
          instructions: prescription.instructions || '',
          durationDays: prescription.durationDays,
          appointmentId: prescription.appointmentId,
        },
        appointmentId: prescription.appointmentId,
        notificationType: 'PRESCRIPTION_AVAILABLE',
      });
    }
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

    // 2. Queue Email Reminder to Patient
    const reminderPayload = {
      recipientName: patient.name,
      doctorName: doctor.name,
      patientName: patient.name,
      date,
      time: `${startTime}–${endTime}`,
      hoursUntil,
      appointmentId: appointment._id ? appointment._id.toString() : '',
    };
    queueEmailNotification({
      to: patient.email,
      recipientName: patient.name,
      templateName: 'appointmentReminder',
      templateData: reminderPayload,
      appointmentId: appointment._id,
      notificationType: 'APPOINTMENT_REMINDER',
    });

    // 3. Queue Email Reminder to Doctor
    queueEmailNotification({
      to: doctor.email,
      recipientName: `Dr. ${doctor.name}`,
      templateName: 'appointmentReminder',
      templateData: reminderPayload,
      appointmentId: appointment._id,
      notificationType: 'APPOINTMENT_REMINDER',
    });
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
    queueEmailNotification({
      to: patientEmail,
      recipientName: patientName,
      templateName: 'doctorLeaveConflict',
      templateData: payload,
      notificationType: 'DOCTOR_LEAVE',
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

/**
 * Dispatch Welcome email with login credentials to newly provisioned Doctor
 * @param {object} doctorUser - { _id, name, email }
 * @param {string} temporaryPassword
 * @param {string} specialization
 */
const dispatchDoctorWelcome = async (doctorUser, temporaryPassword, specialization = 'General Medicine') => {
  try {
    const payload = {
      doctorName: doctorUser.name,
      email: doctorUser.email,
      temporaryPassword,
      specialization,
    };

    // 1. Queue credential email via queue
    queueEmailNotification({
      to: doctorUser.email,
      recipientName: `Dr. ${doctorUser.name}`,
      templateName: 'doctorWelcome',
      templateData: payload,
      notificationType: 'DOCTOR_PROVISIONED',
    });

    // 2. In-app notification
    await createNotification({
      userId: doctorUser._id,
      type: 'ACCOUNT_PROVISIONED',
      title: 'Welcome to HealthPulse Clinical Staff',
      message: `Your doctor account has been activated. Please update your temporary password in profile settings.`,
      metadata: { email: doctorUser.email, specialization },
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorWelcome:', err.message);
  }
};

/**
 * Dispatch Welcome email to newly registered Admin
 * @param {object} adminUser - { _id, name, email }
 */
const dispatchAdminWelcome = async (adminUser) => {
  try {
    const payload = {
      adminName: adminUser.name,
      email: adminUser.email,
    };
    queueEmailNotification({
      to: adminUser.email,
      recipientName: adminUser.name,
      templateName: 'adminWelcome',
      templateData: payload,
      notificationType: 'ACCOUNT_PROVISIONED',
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchAdminWelcome:', err.message);
  }
};

/**
 * Dispatch alert to all system Admins when a new Doctor is provisioned
 * @param {object} doctorUser
 * @param {string} specialization
 * @param {string} provisionedByName
 */
const dispatchDoctorProvisionedAdminAlert = async (doctorUser, specialization, provisionedByName = 'Admin') => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('email name');
    const payload = {
      doctorName: doctorUser.name,
      email: doctorUser.email,
      specialization,
      provisionedByName,
    };

    for (const admin of admins) {
      queueEmailNotification({
        to: admin.email,
        recipientName: admin.name || 'Admin',
        templateName: 'doctorProvisionedAdminAlert',
        templateData: payload,
        notificationType: 'DOCTOR_PROVISIONED',
      });

      createNotification({
        userId: admin._id,
        type: 'DOCTOR_PROVISIONED',
        title: 'New Doctor Profile Provisioned',
        message: `Dr. ${doctorUser.name} (${specialization}) was added to the clinic by ${provisionedByName}.`,
        metadata: { doctorId: doctorUser._id, email: doctorUser.email },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorProvisionedAdminAlert:', err.message);
  }
};

/**
 * Dispatch alert to Admins when a Doctor submits a Leave Request (Pending)
 * @param {object} leave - DoctorLeave document
 * @param {object} doctorUser - Doctor User object
 * @param {string} specialization
 */
const dispatchDoctorLeaveRequestedAdminAlert = async (leave, doctorUser, specialization = 'General Medicine') => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('email name');
    const payload = {
      doctorName: doctorUser.name,
      doctorEmail: doctorUser.email,
      specialization,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    };

    for (const admin of admins) {
      queueEmailNotification({
        to: admin.email,
        recipientName: admin.name || 'Hospital Admin',
        templateName: 'doctorLeaveRequestedAdminAlert',
        templateData: payload,
        notificationType: 'LEAVE_REQUESTED',
      });

      createNotification({
        userId: admin._id,
        type: 'LEAVE_REQUESTED',
        title: 'New Doctor Leave Request Pending Review',
        message: `Dr. ${doctorUser.name} submitted a leave application for ${leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} to ${leave.endDate}`}.`,
        metadata: { leaveId: leave._id, doctorId: doctorUser._id },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorLeaveRequestedAdminAlert:', err.message);
  }
};

/**
 * Dispatch confirmation email to Doctor when Admin Approves or Rejects Leave
 * @param {object} leave - DoctorLeave document
 * @param {object} doctorUser - Doctor User object
 * @param {object} adminUser - Approving Admin User object
 * @param {string} decisionNotes - Admin notes / remarks
 */
const dispatchDoctorLeaveDecisionDoctorAlert = async (leave, doctorUser, adminUser, decisionNotes = '') => {
  try {
    const payload = {
      doctorName: doctorUser.name,
      startDate: leave.startDate,
      endDate: leave.endDate,
      status: leave.status, // 'APPROVED' or 'REJECTED'
      reason: leave.reason,
      adminNotes: decisionNotes || leave.rejectionReason || '',
      approvedByName: adminUser?.name || 'Hospital Administration',
    };

    queueEmailNotification({
      to: doctorUser.email,
      recipientName: `Dr. ${doctorUser.name}`,
      templateName: 'doctorLeaveDecisionDoctorAlert',
      templateData: payload,
      notificationType: 'LEAVE_DECISION',
    });

    createNotification({
      userId: doctorUser._id,
      type: leave.status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      title: `Leave Request ${leave.status === 'APPROVED' ? 'Approved' : 'Declined'}`,
      message: `Your leave request for ${leave.startDate === leave.endDate ? leave.startDate : `${leave.startDate} to ${leave.endDate}`} was ${leave.status.toLowerCase()} by administration.`,
      metadata: { leaveId: leave._id, status: leave.status, adminNotes: decisionNotes },
    }).catch(() => {});
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorLeaveDecisionDoctorAlert:', err.message);
  }
};

/**
 * Dispatch Password Reset Email link to User
 * @param {object} user - User document
 * @param {string} resetToken - Raw unhashed 32-byte reset token
 */
const dispatchPasswordResetEmail = async (user, resetToken) => {
  try {
    const config = require('../config/env');
    const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&role=${user.role}`;

    queueEmailNotification({
      to: user.email,
      recipientName: user.name,
      templateName: 'passwordReset',
      templateData: {
        userName: user.name,
        userRole: user.role,
        resetUrl,
      },
      notificationType: 'PASSWORD_RESET',
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchPasswordResetEmail:', err.message);
  }
};

/**
 * Dispatch Doctor Activation Email (First-time password setup link)
 * @param {object} doctorUser - Doctor User document
 * @param {string} activationToken - Raw unhashed 32-byte activation token
 * @param {string} specialization
 */
const dispatchDoctorActivationEmail = async (doctorUser, activationToken, specialization = 'Consultant Specialist') => {
  try {
    const config = require('../config/env');
    const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
    const setPasswordUrl = `${frontendUrl}/set-password?token=${activationToken}`;

    queueEmailNotification({
      to: doctorUser.email,
      recipientName: `Dr. ${doctorUser.name}`,
      templateName: 'doctorActivation',
      templateData: {
        doctorName: doctorUser.name,
        doctorEmail: doctorUser.email,
        specialization,
        setPasswordUrl,
      },
      notificationType: 'ACCOUNT_ACTIVATION',
    });
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorActivationEmail:', err.message);
  }
};

/**
 * Alert all active Administrators when a user submits a Password Reset Request (Pending Approval)
 * @param {object} resetRequest - PasswordResetRequest document
 * @param {object} requesterUser - Requester User document
 */
const dispatchAdminApprovalAlert = async (resetRequest, requesterUser) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('email name');
    const payload = {
      requesterName: requesterUser.name,
      requesterEmail: requesterUser.email,
      requesterRole: resetRequest.requestedRole,
      requestedAt: resetRequest.requestedAt ? new Date(resetRequest.requestedAt).toLocaleString() : new Date().toLocaleString(),
      requestId: resetRequest._id.toString(),
    };

    for (const admin of admins) {
      queueEmailNotification({
        to: admin.email,
        recipientName: admin.name || 'Hospital Admin',
        templateName: 'passwordRequestPending',
        templateData: payload,
        notificationType: 'PASSWORD_REQUEST_PENDING',
      });

      createNotification({
        userId: admin._id,
        type: 'PASSWORD_RESET_REQUESTED',
        title: 'New Password Reset Request Pending Approval',
        message: `${requesterUser.name} (${resetRequest.requestedRole}) requested a password reset. Review in Admin Portal.`,
        metadata: { requestId: resetRequest._id, requesterId: requesterUser._id },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[NotificationService] Error in dispatchAdminApprovalAlert:', err.message);
  }
};

/**
 * Dispatch 6-Digit OTP Email to User upon Admin Approval
 * @param {object} requesterUser - User document
 * @param {object} resetRequest - PasswordResetRequest document
 * @param {string} rawOtp - Unhashed 6-digit numeric OTP
 */
const dispatchOtpEmail = async (requesterUser, resetRequest, rawOtp) => {
  try {
    const config = require('../config/env');
    const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-otp?requestId=${resetRequest._id.toString()}`;

    queueEmailNotification({
      to: requesterUser.email,
      recipientName: requesterUser.name,
      templateName: 'otpDelivery',
      templateData: {
        userName: requesterUser.name,
        otp: rawOtp,
        verifyUrl,
        expiresMinutes: 10,
      },
      notificationType: 'OTP_DELIVERY',
    });

    createNotification({
      userId: requesterUser._id,
      type: 'PASSWORD_RESET_APPROVED',
      title: 'Password Reset Request Approved',
      message: 'Your password reset request has been approved by administration. Check your email for your 6-digit verification code.',
      metadata: { requestId: resetRequest._id },
    }).catch(() => {});
  } catch (err) {
    console.error('[NotificationService] Error in dispatchOtpEmail:', err.message);
  }
};

/**
 * Alert Administrators when a Doctor submits a Password Reset Request (Pending Approval)
 * @param {object} resetRequest - DoctorResetRequest document
 * @param {object} doctorUser - Doctor User document
 */
const dispatchDoctorResetPendingAlert = async (resetRequest, doctorUser) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('email name');
    const payload = {
      doctorName: doctorUser.name,
      doctorEmail: doctorUser.email,
      requestedAt: resetRequest.requestedAt ? new Date(resetRequest.requestedAt).toLocaleString() : new Date().toLocaleString(),
      requestId: resetRequest._id.toString(),
    };

    for (const admin of admins) {
      queueEmailNotification({
        to: admin.email,
        recipientName: admin.name || 'Hospital Admin',
        templateName: 'doctorResetPending',
        templateData: payload,
        notificationType: 'DOCTOR_RESET_PENDING',
      });

      createNotification({
        userId: admin._id,
        type: 'DOCTOR_RESET_REQUESTED',
        title: 'Doctor Password Reset Pending Review',
        message: `Dr. ${doctorUser.name} requested a password reset. Approval required in Admin Portal.`,
        metadata: { requestId: resetRequest._id, doctorId: doctorUser._id },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorResetPendingAlert:', err.message);
  }
};

/**
 * Dispatch 6-Digit OTP Email to Doctor upon Admin Approval
 * @param {object} doctorUser - Doctor User document
 * @param {object} resetRequest - DoctorResetRequest document
 * @param {string} rawOtp - Unhashed 6-digit numeric OTP
 */
const dispatchDoctorOtpEmail = async (doctorUser, resetRequest, rawOtp) => {
  try {
    const config = require('../config/env');
    const frontendUrl = config.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/doctor/verify-otp?requestId=${resetRequest._id.toString()}`;

    queueEmailNotification({
      to: doctorUser.email,
      recipientName: `Dr. ${doctorUser.name}`,
      templateName: 'doctorOtpDelivery',
      templateData: {
        doctorName: doctorUser.name,
        otp: rawOtp,
        verifyUrl,
        expiresMinutes: 10,
      },
      notificationType: 'DOCTOR_OTP_DELIVERY',
    });

    createNotification({
      userId: doctorUser._id,
      type: 'DOCTOR_RESET_APPROVED',
      title: 'Doctor Password Reset Approved',
      message: 'Your password reset request has been approved by administration. Check your email for your 6-digit verification code.',
      metadata: { requestId: resetRequest._id },
    }).catch(() => {});
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorOtpEmail:', err.message);
  }
};

/**
 * Dispatch Neutral Denial Email to Doctor if Admin Denies Reset Request
 * @param {object} doctorUser - Doctor User document
 * @param {object} resetRequest - DoctorResetRequest document
 */
const dispatchDoctorResetDeniedEmail = async (doctorUser, resetRequest) => {
  try {
    queueEmailNotification({
      to: doctorUser.email,
      recipientName: `Dr. ${doctorUser.name}`,
      templateName: 'doctorResetDenied',
      templateData: {
        doctorName: doctorUser.name,
      },
      notificationType: 'DOCTOR_RESET_DENIED',
    });

    createNotification({
      userId: doctorUser._id,
      type: 'DOCTOR_RESET_DENIED',
      title: 'Doctor Password Reset Update',
      message: 'Your password reset application could not be processed at this time. Contact administration for support.',
      metadata: { requestId: resetRequest._id },
    }).catch(() => {});
  } catch (err) {
    console.error('[NotificationService] Error in dispatchDoctorResetDeniedEmail:', err.message);
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
  dispatchDoctorWelcome,
  dispatchAdminWelcome,
  dispatchDoctorProvisionedAdminAlert,
  dispatchDoctorLeaveRequestedAdminAlert,
  dispatchDoctorLeaveDecisionDoctorAlert,
  dispatchPasswordResetEmail,
  dispatchDoctorActivationEmail,
  dispatchAdminApprovalAlert,
  dispatchOtpEmail,
  dispatchDoctorResetPendingAlert,
  dispatchDoctorOtpEmail,
  dispatchDoctorResetDeniedEmail,
};
