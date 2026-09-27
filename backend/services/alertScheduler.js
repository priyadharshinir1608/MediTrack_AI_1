const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const { runUserAlertCheck } = require('./medicineAlertService');
const { logActivity } = require('./firestoreService');

/**
 * Returns true only when Mongoose is fully connected to MongoDB Atlas
 */
const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Returns current local time formatted as HH:MM in 24-hour format
 */
const getCurrentTimeString = (timezone = 'Asia/Kolkata') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone
    });
    return formatter.format(new Date());
  } catch (err) {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
};

/**
 * Checks all users whose scheduled alert time matches the current minute
 */
const checkScheduledTimeAlerts = async () => {
  // Skip if MongoDB is not ready yet (e.g. startup or transient reconnect)
  if (!isDbReady()) return;

  const currentHHMM = getCurrentTimeString();
  
  try {
    // Find users whose chosen dailyAlertTime matches current HH:MM (or default 08:00)
    const users = await User.find({
      $or: [
        { 'alertSettings.dailyAlertTime': currentHHMM },
        { 'alertSettings.dailyAlertTime': { $exists: false }, $expr: { $eq: [currentHHMM, '08:00'] } }
      ]
    });

    if (users.length > 0) {
      console.log(`[Alert Scheduler] Matching users found for scheduled time [${currentHHMM}]: ${users.length} user(s).`);
      for (const user of users) {
        await runUserAlertCheck(user);
      }
    }
  } catch (err) {
    console.error('[Alert Scheduler] Minute cron execution error:', err.message);
  }
};

/**
 * Triggers an immediate alert check for a specific user or all users (for testing & on-demand scan)
 */
const triggerManualAlertCheck = async (userId = null) => {
  console.log('==================================================');
  console.log(`[Alert Scheduler] Manual Alert Scan Initiated: ${new Date().toISOString()}`);
  console.log('==================================================');

  // Guard: wait for MongoDB to be ready (up to 15 seconds)
  if (!isDbReady()) {
    let waited = 0;
    while (!isDbReady() && waited < 15000) {
      await new Promise(r => setTimeout(r, 500));
      waited += 500;
    }
    if (!isDbReady()) {
      console.error('[Alert Scheduler] MongoDB not ready after 15s — aborting manual scan.');
      return { success: false, error: 'Database not connected. Please try again in a moment.' };
    }
  }

  try {
    let users = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user) users.push(user);
    } else {
      users = await User.find();
    }

    if (users.length === 0) {
      // Use .env email as fallback if no user profile exists in MongoDB yet
      users = [{
        name: 'Pharmacy Staff',
        email: process.env.EMAIL_USER || process.env.GMAIL_USER || 'pharmacist@medscan.ai',
        contactNumber: process.env.ALERT_PHONE || '',
        alertSettings: {
          email: true,
          whatsapp: false,
          expiry: { enabled: true, days: [30, 10, 5, 1] },
          lowStock: { enabled: true, threshold: 10 },
          dailyAlertTime: '08:00'
        }
      }];
    }

    const results = [];
    for (const user of users) {
      const res = await runUserAlertCheck(user);
      results.push(res);
    }

    await logActivity({
      action: 'MANUAL_ALERT_SCAN',
      details: `Dispatched manual alert scan across ${users.length} pharmacy account(s).`
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      currentTime: getCurrentTimeString(),
      userCount: users.length,
      results
    };
  } catch (err) {
    console.error('[Alert Scheduler] Manual alert check error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Initializes the minute-by-minute dynamic alert scheduler
 */
const initAlertScheduler = () => {
  // Runs every minute to support custom user-selected alert times (e.g., 08:00, 09:30, 18:00)
  cron.schedule('* * * * *', async () => {
    await checkScheduledTimeAlerts();
  });

  console.log('[Alert Scheduler] Dynamic Minute-by-Minute Cron Active (Evaluates user-selected daily alert times).');
};

module.exports = {
  initAlertScheduler,
  triggerManualAlertCheck,
  getCurrentTimeString
};
