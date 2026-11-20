// This file is now deprecated in favor of the use-firebase.tsx hook.
// It is kept for potential legacy imports but should not be used for new development.
// All firebase instances should be retrieved from the useFirebase() or related hooks.
//
// IMPORTANT (Phase 1 fix): Firebase init here is LAZY and GUARDED.
// Vercel Preview deployments have no Firebase env vars (Production-only),
// and `getAuth()` throws `auth/invalid-api-key` when the API key is missing,
// which used to fail `next build` during "Collecting page data" (e.g. the
// sitemap routes import this module via @/lib/firebase/firestore).
// With no/invalid keys, all exports below are `null` and the build succeeds;
// Firebase-dependent code degrades gracefully and only initialises in the
// browser at runtime when keys are present. Never hard-code keys here.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

export interface FirebaseInstances {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  googleProvider: GoogleAuthProvider | null;
  messaging: Messaging | null;
}

let cached: FirebaseInstances | null = null;

/** Lazily create (once) the Firebase instances, or all-nulls when unconfigured. Never throws. */
export function getFirebase(): FirebaseInstances {
  if (cached) return cached;

  const empty: FirebaseInstances = {
    app: null, auth: null, db: null, storage: null, googleProvider: null, messaging: null,
  };
  if (!hasFirebaseConfig) {
    if (typeof window !== 'undefined') {
      console.warn('[firebase] NEXT_PUBLIC_FIREBASE_* keys are missing — Firebase is disabled.');
    }
    cached = empty;
    return cached;
  }

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    let auth: Auth | null = null;
    try {
      auth = getAuth(app);
    } catch (e) {
      console.warn('[firebase] getAuth failed (invalid API key?) — auth disabled.', e);
    }
    let db: Firestore | null = null;
    try {
      db = getFirestore(app, "deshexam");
    } catch (e) {
      try {
        db = getFirestore(app);
      } catch (e2) {
        console.warn('[firebase] getFirestore failed — Firestore disabled.', e2);
      }
    }
    let storage: FirebaseStorage | null = null;
    try {
      storage = getStorage(app);
    } catch (e) {
      console.warn('[firebase] getStorage failed.', e);
    }
    const googleProvider = auth ? new GoogleAuthProvider() : null;
    const messaging = typeof window !== 'undefined' ? (() => { try { return getMessaging(app); } catch { return null; } })() : null;
    cached = { app, auth, db, storage, googleProvider, messaging };
  } catch (e) {
    console.warn('[firebase] Firebase init failed — running without Firebase.', e);
    cached = empty;
  }
  return cached;
}

// Legacy named exports — preserved so existing `import { db } from ...` keeps
// working. At RUNTIME they are `null` when Firebase is unconfigured (e.g.
// Preview builds without env vars); the declared types stay non-nullable
// because ~100 existing call sites assume a Firestore instance, and the
// guarded helpers (getFirebase, hasFirebaseConfig, and the null-checked
// readers in lib/firebase/assessment, taxonomy and challenges) are the
// safe paths. New code should use getFirebase() / hasFirebaseConfig.
const instances = getFirebase();
export const app = instances.app as FirebaseApp;
export const auth = instances.auth as Auth;
export const db = instances.db as Firestore;
export const storage = instances.storage as FirebaseStorage;
export const googleProvider = instances.googleProvider as GoogleAuthProvider;
export const messaging = instances.messaging as Messaging;
