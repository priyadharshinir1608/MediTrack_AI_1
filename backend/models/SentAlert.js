const mongoose = require('mongoose');

const sentAlertSchema = new mongoose.Schema(
  {
    notificationKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true
    },
    medicineName: {
      type: String,
      default: ''
    },
    batchNumber: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['expiry', 'low_stock'],
      required: true,
      index: true
    },
    alertLevel: {
      type: String,
      default: ''
    },
    channel: {
      type: String,
      enum: ['email', 'whatsapp', 'firestore'],
      required: true,
      index: true
    },
    notificationDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    recipient: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['delivered', 'simulated', 'failed'],
      default: 'delivered'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SentAlert', sentAlertSchema);
