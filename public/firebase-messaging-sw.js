// DO NOT EDIT
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
// DO NOT EDIT

const firebaseConfig = {
  apiKey: "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  authDomain: "studio-8356746366-699c1.firebaseapp.com",
  projectId: "studio-8356746366-699c1",
  storageBucket: "studio-8356746366-699c1.firebasestorage.app",
  messagingSenderId: "643911224795",
  appId: "1:643911224795:web:ea10a865635776d4932bfe"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Exit early if a client is already focused.
  // This prevents double notifications.
  if (self.clients.focused) {
    return;
  }
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});