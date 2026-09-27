const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'pharmacist', 'staff'],
      default: 'pharmacist'
    },
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    contactNumber: {
      type: String,
      default: ''
    },
    // User-Controlled Gmail + WhatsApp Alert Settings
    alertSettings: {
      email: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: true
      },
      expiry: {
        enabled: { type: Boolean, default: true },
        days: { type: [Number], default: [30, 10, 5, 1] }
      },
      lowStock: {
        enabled: { type: Boolean, default: true },
        threshold: { type: Number, default: 10 }
      },
      dailyAlertTime: {
        type: String,
        default: '08:00' // Format: HH:MM (24-hour)
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
