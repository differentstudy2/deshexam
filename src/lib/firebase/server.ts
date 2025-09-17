import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-8356746366-699c1",
  "appId": "1:643911224795:web:ea10a865635776d4932bfe",
  "storageBucket": "studio-8356746366-699c1.firebasestorage.app",
  "apiKey": "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  "authDomain": "studio-8356746366-699c1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "643911224795"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
