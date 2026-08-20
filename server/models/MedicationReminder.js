const mongoose = require('mongoose');

const medicationReminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: [true, 'Prescription ID is required'],
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: 'Take with water after meals',
    },
    scheduledDate: {
      type: String,
      required: [true, 'Scheduled date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Scheduled time must be in 24-hour format HH:mm',
      ],
      index: true,
    },
    scheduledDateTime: {
      type: Date,
      required: [true, 'Scheduled Date-Time is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'SENT', 'TAKEN', 'MISSED', 'CANCELLED'],
        message: '{VALUE} is not a valid reminder status',
      },
      default: 'PENDING',
      index: true,
    },
    takenAt: {
      type: Date,
      default: null,
    },
    notificationSentAt: {
      type: Date,
      default: null,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Idempotency Compound Unique Index: prevents duplicate reminder slot for the same medicine in a prescription
medicationReminderSchema.index(
  {
    prescriptionId: 1,
    medicineName: 1,
    scheduledDate: 1,
    scheduledTime: 1,
  },
  { unique: true }
);

// Fast worker querying and patient history indexing
medicationReminderSchema.index({ patientId: 1, status: 1, scheduledDate: 1 });
medicationReminderSchema.index({ status: 1, scheduledDateTime: 1 });

const MedicationReminder = mongoose.model(
  'MedicationReminder',
  medicationReminderSchema
);

module.exports = MedicationReminder;
