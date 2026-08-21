const mongoose = require('mongoose');

const clinicalRecordSchema = new mongoose.Schema(
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
    clinicalNotes: {
      type: String,
      required: [true, 'Clinical notes are required'],
      trim: true,
      minlength: [3, 'Clinical notes must be at least 3 characters long'],
      maxlength: [5000, 'Clinical notes cannot exceed 5000 characters'],
    },
    diagnosisNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Diagnosis notes cannot exceed 2000 characters'],
      default: '',
    },
    patientInstructions: {
      type: String,
      trim: true,
      maxlength: [3000, 'Patient instructions cannot exceed 3000 characters'],
      default: '',
    },
    followUpDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Follow-up date must be in YYYY-MM-DD format'],
      default: null,
    },
    postVisitSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    aiStatus: {
      type: String,
      enum: ['PENDING', 'READY', 'FAILED'],
      default: 'PENDING',
    },
    aiPromptVersion: {
      type: String,
      default: null,
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

clinicalRecordSchema.index({ patientId: 1, createdAt: -1 });
clinicalRecordSchema.index({ doctorId: 1, createdAt: -1 });

const ClinicalRecord = mongoose.model('ClinicalRecord', clinicalRecordSchema);

module.exports = ClinicalRecord;
