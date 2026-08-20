const mongoose = require('mongoose');

const doctorLeaveSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor User ID is required'],
      index: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'],
      index: true,
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'],
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Leave reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'APPROVED',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
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

// Compound Indexes for fast conflict checks and doctor availability querying
doctorLeaveSchema.index({ doctorId: 1, status: 1 });
doctorLeaveSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });
doctorLeaveSchema.index({ startDate: 1, endDate: 1, status: 1 });

const DoctorLeave = mongoose.model('DoctorLeave', doctorLeaveSchema);

module.exports = DoctorLeave;
