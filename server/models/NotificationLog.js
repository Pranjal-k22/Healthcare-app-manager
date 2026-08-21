const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    notificationType: {
      type: String,
      required: [true, 'Notification type is required'],
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'dead'],
      default: 'sent',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    lastError: {
      type: String,
      default: '',
    },
    nextRetryAt: {
      type: Date,
      default: null,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for retry worker query
notificationLogSchema.index({ status: 1, nextRetryAt: 1, attempts: 1 });

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;
