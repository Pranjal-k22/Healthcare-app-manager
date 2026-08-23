const mongoose = require('mongoose');

const calendarConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'GOOGLE',
      enum: ['GOOGLE'],
    },
    googleAccountEmail: {
      type: String,
      trim: true,
      default: '',
    },
    accessToken: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (this.isConnected) {
            return typeof v === 'string' && v.trim().length > 0;
          }
          return true;
        },
        message: 'Access token is required when connected',
      },
    },
    refreshToken: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Number,
      default: 0,
    },
    scope: {
      type: [String],
      default: [],
    },
    calendarId: {
      type: String,
      default: 'primary',
    },
    isConnected: {
      type: Boolean,
      default: true,
      index: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Strip sensitive OAuth tokens from JSON serialization
        delete ret.accessToken;
        delete ret.refreshToken;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

calendarConnectionSchema.index({ userId: 1, isConnected: 1 });

const CalendarConnection = mongoose.model('CalendarConnection', calendarConnectionSchema);

module.exports = CalendarConnection;
