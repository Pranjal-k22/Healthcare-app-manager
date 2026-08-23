const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    requestedRole: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
      required: [true, 'Requested role is required'],
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
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours TTL
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

// TTL Index: Auto-evict expired PENDING requests after 24 hours
passwordResetRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetRequest = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);

module.exports = PasswordResetRequest;
