import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import api from './api';

// Configurable VAPID key (reads from environment or settings)
export const getStoredVapidKey = () => {
  return localStorage.getItem('medscan_fcm_vapid_key') || import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
};

export const setStoredVapidKey = (key) => {
  if (key) {
    localStorage.setItem('medscan_fcm_vapid_key', key.trim());
  } else {
    localStorage.removeItem('medscan_fcm_vapid_key');
  }
};

/**
 * Requests browser notification permission and retrieves device FCM Token
 */
export const enableNotifications = async (customVapidKey = null) => {
  try {
    if (!('Notification' in window)) {
      console.warn('[Notification Service] Browser does not support desktop notifications.');
      return { success: false, message: 'Browser does not support notifications.' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[Notification Service] Notification permission was not granted:', permission);
      return { success: false, message: 'Notification permission was denied. Please allow notifications in your browser address bar.' };
    }

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (swErr) {
        console.warn('[Notification Service] Service worker registration note:', swErr.message);
      }
    }

    const messagingInstance = await messaging;
    if (!messagingInstance) {
      return { success: false, message: 'FCM is not supported or service worker is unavailable in this environment.' };
    }

    const vapidKey = customVapidKey || getStoredVapidKey();
    const tokenOptions = vapidKey && vapidKey.length > 20 ? { vapidKey } : undefined;

    const token = await getToken(messagingInstance, tokenOptions);

    if (token) {
      console.log('[Notification Service] Device FCM Token generated:', token);
      
      // Sync token to user profile in MongoDB
      try {
        const deviceName = navigator.userAgent.includes('Android')
          ? 'Android Phone / Chrome'
          : navigator.userAgent.includes('Mobile')
          ? 'Mobile Browser'
          : 'Desktop PC / Browser';

        await api.post('/notifications/fcm-token', {
          token,
          device: deviceName
        });
        console.log('[Notification Service] FCM Token saved to backend user profile.');
      } catch (syncErr) {
        console.warn('[Notification Service] Backend token sync note:', syncErr.message);
      }

      return { success: true, token };
    } else {
      return { success: false, message: 'No registration token available from Firebase.' };
    }
  } catch (error) {
    console.error('[Notification Service] FCM Setup Error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Foreground message listener for in-app alert banners / toasts
 */
export const setupForegroundMessageListener = async (onMessageCallback) => {
  try {
    const messagingInstance = await messaging;
    if (!messagingInstance) return null;

    return onMessage(messagingInstance, (payload) => {
      console.log('[Notification Service] In-app foreground push received:', payload);
      if (onMessageCallback) {
        onMessageCallback(payload);
      }
    });
  } catch (err) {
    console.warn('[Notification Service] Listener setup warning:', err.message);
    return null;
  }
};
