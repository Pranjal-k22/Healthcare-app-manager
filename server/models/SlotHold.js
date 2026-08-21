const mongoose = require('mongoose');

const slotHoldSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient User ID is required'],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
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

// Compound index for efficient slot-level querying (not unique to allow expired holds before TTL cleanup)
slotHoldSchema.index({ doctorId: 1, date: 1, startTime: 1 });

// TTL index to automatically purge expired holds
slotHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SlotHold = mongoose.model('SlotHold', slotHoldSchema);

module.exports = SlotHold;
