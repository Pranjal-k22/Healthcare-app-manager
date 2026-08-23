const mongoose = require('mongoose');

const doctorResetRequestSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor User ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    otpHash: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours TTL
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.otpHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Partial TTL Index: Auto-evict unreviewed PENDING requests after 24 hours (preserves APPROVED, DENIED, & COMPLETED audit records)
doctorResetRequestSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { status: 'PENDING' } }
);

const DoctorResetRequest = mongoose.model('DoctorResetRequest', doctorResetRequestSchema);

module.exports = DoctorResetRequest;
