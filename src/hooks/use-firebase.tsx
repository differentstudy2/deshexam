
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  messaging: Messaging | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
  messaging: null,
});

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [firebase, setFirebase] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    messaging: null,
  });

  useEffect(() => {
    // Guarded: with no Firebase keys (e.g. Vercel Preview), skip init and
    // leave the context nulls — Firebase features degrade gracefully.
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('[firebase] NEXT_PUBLIC_FIREBASE_* keys are missing — Firebase is disabled.');
      return;
    }
    let auth: Auth | null = null;
    try {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      let db: Firestore;
      try {
        db = getFirestore(app, "deshexam");
      } catch (e) {
        console.error("Error getting Firestore instance", e);
        db = getFirestore(app);
      }
      const storage = getStorage(app);
      const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
      setFirebase({ app, auth, db, storage, messaging });
    } catch (e) {
      console.warn('[firebase] Firebase init failed — running without Firebase.', e);
    }
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).db;
