importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDpEYoEJBt2V_2LmE5ngMuOqYvfUhrT9so",
  authDomain: "deshexam01.firebaseapp.com",
  projectId: "deshexam01",
  storageBucket: "deshexam01.firebasestorage.app",
  messagingSenderId: "404640688923",
  appId: "1:404640688923:web:e8e813225d2f8a1f40c1be",
  measurementId: "G-JPQ93151YS"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload?.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload?.notification?.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
