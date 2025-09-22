
// This service worker can be customized!
// See https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker

self.addEventListener("install", (event) => {
    console.log("Service worker installed");
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activated");
});

self.addEventListener('push', (event) => {
    console.log('Push message received:', event);
    const notificationData = event.data.json();

    const title = notificationData.title;
    const options = {
        body: notificationData.body,
        icon: '/icon-192x192.png', // Make sure you have an icon in your public folder
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
