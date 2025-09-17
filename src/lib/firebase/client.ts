import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "apiKey": "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  "authDomain": "studio-8356746366-699c1.firebaseapp.com",
  "projectId": "studio-8356746366-699c1",
  "storageBucket": "studio-8356746366-699c1.firebasestorage.app",
  "messagingSenderId": "643911224795",
  "appId": "1:643911224795:web:ea10a865635776d4932bfe",
  "measurementId": ""
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
