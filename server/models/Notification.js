const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'APPOINTMENT_BOOKED',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_RESCHEDULED',
  'APPOINTMENT_REMINDER',
  'PRESCRIPTION_AVAILABLE',
  'MEDICATION_REMINDER',
  'ACCOUNT_PROVISIONED',
  'DOCTOR_PROVISIONED',
  'SYSTEM_ALERT',
  'PASSWORD_RESET',
  'DOCTOR_RESET_REQUESTED',
  'DOCTOR_RESET_APPROVED',
  'DOCTOR_RESET_DENIED',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a supported notification type',
      },
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    relatedAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for optimal queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ relatedAppointmentId: 1, type: 1, userId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Notification,
  NOTIFICATION_TYPES,
};
