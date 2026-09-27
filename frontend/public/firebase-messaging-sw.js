/* eslint-disable no-undef */
// Service worker for Firebase Cloud Messaging Web Push notifications
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDHM4xffvC5UaIMqmjr95UXksUs5aL5WG8",
  authDomain: "meditrack-ai-69dee.firebaseapp.com",
  projectId: "meditrack-ai-69dee",
  storageBucket: "meditrack-ai-69dee.firebasestorage.app",
  messagingSenderId: "286542089959",
  appId: "1:286542089959:web:d8e6ac7eb6a18a4d975c42",
  measurementId: "G-ZFGQP9G0GN"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background push notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const title = payload.notification?.title || payload.data?.title || 'MedScan AI Alert';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'New inventory notification received.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.tag || 'medscan-alert',
    data: payload.data || {},
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(title, options);
});

// Handle notification click: focus existing window or open dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
