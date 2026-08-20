const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient User ID is required'],
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor User ID is required'],
      index: true,
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Start time must be in 24-hour format HH:mm',
      ],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'End time must be in 24-hour format HH:mm',
      ],
    },
    status: {
      type: String,
      enum: {
        values: ['BOOKED', 'COMPLETED', 'CANCELLED'],
        message: '{VALUE} is not a valid appointment status',
      },
      default: 'BOOKED',
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
      default: '',
    },
    patientNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Patient notes cannot exceed 1000 characters'],
      default: '',
    },
    googleCalendarEventId: {
      type: String,
      default: null,
    },
    calendarSyncStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'SYNCED', 'FAILED'],
      default: 'NOT_REQUIRED',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual alias for appointmentDate
appointmentSchema.virtual('appointmentDate').get(function () {
  return this.date;
});

// Compound Partial Unique Index for Database-Level Double-Booking Prevention
// Applies strictly to active booking states ('BOOKED', 'COMPLETED').
// When an appointment is 'CANCELLED', the partial index allows the slot to be booked again.
appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['BOOKED', 'COMPLETED'] },
    },
    name: 'unique_active_doctor_slot',
  }
);

// Optimized compound query indexes
appointmentSchema.index({ patientId: 1, date: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
