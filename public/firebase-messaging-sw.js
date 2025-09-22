
// Import the Firebase app and messaging services
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging.js');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  authDomain: "studio-8356746366-699c1.firebaseapp.com",
  projectId: "studio-8356746366-699c1",
  storageBucket: "studio-8356746366-699c1.firebasestorage.app",
  messagingSenderId: "643911224795",
  appId: "1:643911224795:web:ea10a865635776d4932bfe"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Check if the app is already in the foreground. If so, don't show a notification.
  // The foreground message will be handled by the main app.
  self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((clients) => {
    let isAppInForeground = false;
    clients.forEach((client) => {
      if (client.visibilityState === 'visible') {
        isAppInForeground = true;
      }
    });

    if (isAppInForeground) {
      console.log('App is in the foreground, not showing notification.');
      return;
    }

    // If app is not in foreground, show the notification.
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || '/icon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
});
