import * as admin from 'firebase-admin';

export function getAdminDb() {
  if (!admin.apps.length) {
    try {
      let credential;
      if (process.env.GCP_SA_KEY) {
        const parsed = JSON.parse(process.env.GCP_SA_KEY);
        if (parsed.private_key) {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        credential = admin.credential.cert(parsed);
      } else {
        credential = admin.credential.applicationDefault();
      }
      admin.initializeApp({ credential });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  }
  if (admin.apps.length) {
    return admin.firestore();
  }
  return null as unknown as admin.firestore.Firestore; // Or handle gracefully
}

export const adminDb = getAdminDb();
export const adminAuth = admin.apps.length ? admin.auth() : null;
