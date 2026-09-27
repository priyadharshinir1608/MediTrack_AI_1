const { firestore, firebaseInitialized } = require('../config/firebase');
const User = require('../models/User');
const { sendTestEmail } = require('../services/emailAlertService');
const { sendTestWhatsApp } = require('../services/whatsappAlertService');
const { triggerManualAlertCheck, getCurrentTimeString } = require('../services/alertScheduler');

/**
 * Get in-app notification history from Firestore
 */
const getNotifications = async (req, res, next) => {
  try {
    if (!firebaseInitialized || !firestore) {
      return res.status(200).json({
        success: true,
        notifications: [
          { id: '1', title: 'Low Stock Alert', message: 'Amoxicillin 250mg is below safety threshold (8 units left).', type: 'warning', isRead: false },
          { id: '2', title: 'Expiry Warning', message: 'Cough Syrup 100ml batch B-77889 expires in 28 days.', type: 'danger', isRead: false }
        ]
      });
    }

    const snapshot = await firestore.collection('notifications').orderBy('timestamp', 'desc').limit(30).get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (firebaseInitialized && firestore) {
      await firestore.collection('notifications').doc(id).update({ isRead: true });
    }
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user alert settings & contact details
 */
const getNotificationSettings = async (req, res, next) => {
  try {
    const uid = req.user?.firebaseUid || req.firebaseUser?.uid;
    const user = uid ? await User.findOne({ firebaseUid: uid }) : null;

    const defaultSettings = {
      email: true,
      whatsapp: true,
      expiry: {
        enabled: true,
        days: [30, 10, 5, 1]
      },
      lowStock: {
        enabled: true,
        threshold: 10
      },
      dailyAlertTime: '08:00',
      timezone: 'Asia/Kolkata'
    };

    res.status(200).json({
      success: true,
      userEmail: user?.email || req.firebaseUser?.email || '',
      contactNumber: user?.contactNumber || user?.phone || '',
      alertSettings: user?.alertSettings || defaultSettings,
      currentTime: getCurrentTimeString()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user alert settings & contact details
 */
const updateNotificationSettings = async (req, res, next) => {
  try {
    const uid = req.user?.firebaseUid || req.firebaseUser?.uid;
    const { alertSettings, contactNumber, email } = req.body;

    const updateFields = {};
    if (alertSettings) updateFields.alertSettings = alertSettings;
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;
    if (email) updateFields.email = email;

    let updatedUser = null;
    if (uid) {
      updatedUser = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $set: updateFields },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Alert preferences updated successfully',
      alertSettings: updatedUser?.alertSettings || alertSettings,
      contactNumber: updatedUser?.contactNumber || contactNumber
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send an Instant Test Email
 */
const testEmailAlert = async (req, res, next) => {
  try {
    const uid = req.user?.firebaseUid || req.firebaseUser?.uid;
    const user = uid ? await User.findOne({ firebaseUid: uid }) : null;
    const targetEmail = req.body.email || user?.email || req.firebaseUser?.email;

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'No email address provided' });
    }

    const result = await sendTestEmail({
      toEmail: targetEmail,
      userName: user?.name || 'Pharmacy Owner'
    });

    res.status(200).json({
      success: true,
      message: `Test email alert dispatched to ${targetEmail}`,
      result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send an Instant Test WhatsApp Alert
 */
const testWhatsAppAlert = async (req, res, next) => {
  try {
    const uid = req.user?.firebaseUid || req.firebaseUser?.uid;
    const user = uid ? await User.findOne({ firebaseUid: uid }) : null;
    const targetPhone = req.body.contactNumber || user?.contactNumber || user?.phone;

    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: 'No contact number provided. Please enter your WhatsApp number with country code (e.g. +91 98765 43210).'
      });
    }

    const result = await sendTestWhatsApp({
      toPhone: targetPhone,
      userName: user?.name || 'Pharmacy Owner'
    });

    res.status(200).json({
      success: true,
      message: `Test WhatsApp alert dispatched to ${targetPhone}`,
      result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Manually trigger the alert check engine
 */
const triggerDailyCheck = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await triggerManualAlertCheck(user?._id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  testEmailAlert,
  testWhatsAppAlert,
  triggerDailyCheck
};
