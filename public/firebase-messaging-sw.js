
// Import the Firebase app and messaging modules
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Background message handler (optional)
// You can add custom logic here to handle background messages if needed.
// For now, it will just show the notification as sent from the server.
