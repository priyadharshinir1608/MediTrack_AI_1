const { firestore, firebaseInitialized } = require('../config/firebase');

const addNotification = async (notification) => {
  if (!firebaseInitialized || !firestore) {
    console.log('[Firestore Service] Notification logged (Mock mode):', notification.title);
    return { id: 'mock_' + Date.now(), ...notification };
  }

  try {
    const docRef = await firestore.collection('notifications').add({
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      medicineId: notification.medicineId || null,
      isRead: false,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...notification };
  } catch (err) {
    console.warn('[Firestore Service] Notification fallback:', err.message);
    return null;
  }
};

const logActivity = async (activity) => {
  if (!firebaseInitialized || !firestore) {
    console.log('[Firestore Service] Activity Log (Mock mode):', activity.action);
    return;
  }

  try {
    await firestore.collection('activityLogs').add({
      action: activity.action,
      details: activity.details || '',
      userId: activity.userId || 'system',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Firestore Service] Activity Log error:', err.message);
  }
};

module.exports = {
  addNotification,
  logActivity
};
