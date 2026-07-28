
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyAzSss2t5UoydcGRh4CJ41VvE4x-t0Ikrc",
  authDomain: "studio-8356746366-699c1.firebaseapp.com",
  projectId: "studio-8356746366-699c1",
  storageBucket: "studio-8356746366-699c1.firebasestorage.app",
  messagingSenderId: "643911224795",
  appId: "1:643911224795:web:ea10a865635776d4932bfe"
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
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    let db: Firestore;
    try {
      if (typeof window !== 'undefined') {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
        });
      } else {
        db = getFirestore(app);
      }
    } catch (e) {
      db = getFirestore(app);
    }
    const storage = getStorage(app);
    const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
    
    setFirebase({ app, auth, db, storage, messaging });
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
