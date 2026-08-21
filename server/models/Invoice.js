const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Line item description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Line item amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
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
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    lineItems: {
      type: [lineItemSchema],
      default: [],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'An invoice must contain at least one line item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'overdue'],
        message: '{VALUE} is not a valid invoice status',
      },
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

invoiceSchema.index({ patientId: 1, status: 1 });
invoiceSchema.index({ patientId: 1, issueDate: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
