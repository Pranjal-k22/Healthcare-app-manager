const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      minlength: [2, 'Medicine name must be at least 2 characters long'],
      maxlength: [120, 'Medicine name cannot exceed 120 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 500mg, 10ml)'],
      trim: true,
      maxlength: [60, 'Dosage cannot exceed 60 characters'],
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required (e.g. Twice daily, Once at bedtime)'],
      trim: true,
      maxlength: [80, 'Frequency cannot exceed 80 characters'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 5 days, 2 weeks)'],
      trim: true,
      maxlength: [60, 'Duration cannot exceed 60 characters'],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [250, 'Instructions cannot exceed 250 characters'],
      default: 'Take with water after meals',
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
      index: true,
    },
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
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
      index: true,
    },
    durationDays: {
      type: Number,
      default: 14,
      min: 1,
    },
    medicines: {
      type: [medicineItemSchema],
      default: [],
    },
    additionalInstructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Additional instructions cannot exceed 2000 characters'],
      default: '',
    },
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

prescriptionSchema.index({ patientId: 1, status: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
