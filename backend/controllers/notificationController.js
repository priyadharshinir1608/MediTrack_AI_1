const { firestore, firebaseInitialized } = require('../config/firebase');

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

    const snapshot = await firestore.collection('notifications').orderBy('timestamp', 'desc').limit(20).get();
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

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

module.exports = {
  getNotifications,
  markAsRead
};
