import { getAdminDb } from './admin'; // This ensures admin is initialized
import * as admin from 'firebase-admin';

/**
 * Verifies the Authorization: Bearer <token> header from a request.
 * Returns the decoded token if valid, or null if missing/invalid.
 */
export async function verifyAuthToken(req: Request) {
  try {
    // Ensure admin is initialized
    getAdminDb(); 

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return null;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}
