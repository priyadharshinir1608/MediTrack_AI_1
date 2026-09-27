const { admin, firebaseInitialized } = require('../config/firebase');
const User = require('../models/User');

/**
 * Sends FCM push notification to specific device tokens using Firebase Admin SDK
 */
const sendMulticastPush = async (tokens, { title, body, data = {} }) => {
  if (!tokens || tokens.length === 0) {
    return { success: false, message: 'No device tokens provided', count: 0 };
  }

  // Remove duplicate & empty tokens
  const uniqueTokens = [...new Set(tokens.filter(t => typeof t === 'string' && t.trim().length > 0))];
  if (uniqueTokens.length === 0) {
    return { success: false, message: 'No valid tokens provided', count: 0 };
  }

  if (!firebaseInitialized) {
    console.log(`[FCM Simulation] Push dispatched to ${uniqueTokens.length} devices:`, { title, body });
    return { success: true, simulated: true, count: uniqueTokens.length };
  }

  try {
    const messagePayload = {
      tokens: uniqueTokens,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: '/',
        timestamp: new Date().toISOString()
      },
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: '/'
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(messagePayload);
    console.log(`[FCM Push] Multicast dispatched: ${response.successCount} succeeded, ${response.failureCount} failed.`);

    // Clean up stale or unregistered tokens automatically
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            failedTokens.push(uniqueTokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await User.updateMany(
          {},
          { $pull: { fcmTokens: { token: { $in: failedTokens } } } }
        );
        console.log(`[FCM] Cleaned up ${failedTokens.length} invalid/unregistered device tokens.`);
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('[FCM Service] Multicast push error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sends FCM push notification to all users who have enabled a specific notification preference
 */
const sendPushToSubscribers = async (preferenceType, { title, body, data = {} }) => {
  try {
    const filter = {};
    if (preferenceType === 'expiry') {
      filter['notificationPreferences.expiryAlerts'] = { $ne: false };
    } else if (preferenceType === 'low_stock') {
      filter['notificationPreferences.lowStockAlerts'] = { $ne: false };
    }

    const users = await User.find(filter);
    const tokens = [];
    users.forEach(u => {
      if (u.fcmTokens && Array.isArray(u.fcmTokens)) {
        u.fcmTokens.forEach(tObj => {
          if (tObj && tObj.token) tokens.push(tObj.token);
        });
      }
    });

    if (tokens.length === 0) {
      return { success: false, message: 'No registered devices found for preference: ' + preferenceType, count: 0 };
    }

    return await sendMulticastPush(tokens, { title, body, data });
  } catch (err) {
    console.error('[FCM Service] Subscriber push error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendMulticastPush,
  sendPushToSubscribers
};
