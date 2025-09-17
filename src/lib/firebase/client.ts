import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "studio-8356746366-699c1",
  "appId": "1:643911224795:web:ea10a865635776d4932bfe",
  "storageBucket": "studio-8356746366-699c1.firebasestorage.app",
  "apiKey": "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  "authDomain": "studio-8356746366-699c1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "643911224795"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
