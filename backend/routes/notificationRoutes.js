const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  testEmailAlert,
  testWhatsAppAlert,
  triggerDailyCheck
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markAsRead);

// Alert Settings & Channels (Gmail + WhatsApp + Time)
router.get('/settings', verifyToken, getNotificationSettings);
router.put('/settings', verifyToken, updateNotificationSettings);

// Instant Testing Endpoints
router.post('/test-email', verifyToken, testEmailAlert);
router.post('/test-whatsapp', verifyToken, testWhatsAppAlert);

// On-Demand Alert Scan Trigger
router.post('/run-daily-check', verifyToken, triggerDailyCheck);

module.exports = router;
