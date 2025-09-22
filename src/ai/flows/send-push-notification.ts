
'use server';

/**
 * @fileOverview Sends push notifications to all subscribed users.
 * - sendPushNotification: A function that handles sending the notification.
 * - PushNotificationInput: Input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// Correctly format the service account credentials to avoid parsing errors.
const serviceAccount = {
  "type": "service_account",
  "project_id": "studio-8356746366-699c1",
  "private_key_id": "060d4cae81216d60ba838053a5b6f7902f5e3687",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZBH4gH5lB8F8z\nfJd9pI9cW+iG94s9v2qN7E7Z1s2v6D6g5Z4v8T5f7o6y6w4e6Y3f3v7w6D3e4n5\nb8c7r8i4g1a5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j8a6g6b8b8i9c5g3j\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-q0tb5@studio-8356746366-699c1.iam.gserviceaccount.com",
  "client_id": "116550734045388063533",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q0tb5%40studio-8356746366-699c1.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin SDK
let app: App;
if (!getApps().length) {
    app = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

const PushNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main message content of the notification.'),
});
export type PushNotificationInput = z.infer<typeof PushNotificationInputSchema>;

export async function sendPushNotification(input: PushNotificationInput): Promise<void> {
  return sendPushNotificationFlow(input);
}

const sendPushNotificationFlow = ai.defineFlow(
  {
    name: 'sendPushNotificationFlow',
    inputSchema: PushNotificationInputSchema,
    outputSchema: z.void(),
  },
  async ({ title, body }) => {
    try {
      const tokensSnapshot = await db.collection('fcmTokens').get();
      if (tokensSnapshot.empty) {
        console.log('No tokens found to send notifications.');
        return;
      }

      const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
      
      if (tokens.length === 0) {
        console.log('No valid tokens found.');
        return;
      }

      const message = {
        notification: {
          title,
          body,
        },
        tokens: tokens,
      };

      const response = await getMessaging(app).sendEachForMulticast(message);
      console.log(`${response.successCount} messages were sent successfully`);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
        // Here you might want to remove the failed tokens from your database
      }

    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new Error('Failed to send push notifications.');
    }
  }
);
