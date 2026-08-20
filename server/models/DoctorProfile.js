const mongoose = require('mongoose');

const workingDaySchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    start: {
      type: String,
      default: null,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'Start time must be in 24-hour format HH:mm (e.g. 09:00)',
      ],
    },
    end: {
      type: String,
      default: null,
      match: [
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        'End time must be in 24-hour format HH:mm (e.g. 17:00)',
      ],
    },
  },
  { _id: false }
);

const leaveSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Leave date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Leave date must be in YYYY-MM-DD format'],
    },
    reason: {
      type: String,
      trim: true,
      default: 'Unavailable',
    },
  },
  { _id: true, timestamps: true }
);

const doctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User ID is required'],
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      minlength: [2, 'Specialization must be at least 2 characters long'],
      maxlength: [100, 'Specialization cannot exceed 100 characters'],
    },
    slotDuration: {
      type: Number,
      required: [true, 'Slot duration in minutes is required'],
      default: 30,
      min: [5, 'Slot duration must be at least 5 minutes'],
      max: [240, 'Slot duration cannot exceed 240 minutes'],
    },
    workingHours: {
      monday: { type: workingDaySchema, default: () => ({ enabled: true, start: '09:00', end: '17:00' }) },
      tuesday: { type: workingDaySchema, default: () => ({ enabled: true, start: '09:00', end: '17:00' }) },
      wednesday: { type: workingDaySchema, default: () => ({ enabled: true, start: '09:00', end: '17:00' }) },
      thursday: { type: workingDaySchema, default: () => ({ enabled: true, start: '09:00', end: '17:00' }) },
      friday: { type: workingDaySchema, default: () => ({ enabled: true, start: '09:00', end: '17:00' }) },
      saturday: { type: workingDaySchema, default: () => ({ enabled: false, start: null, end: null }) },
      sunday: { type: workingDaySchema, default: () => ({ enabled: false, start: null, end: null }) },
    },
    leaves: [leaveSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;
