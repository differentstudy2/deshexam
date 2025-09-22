
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

// Initialize Firebase Admin SDK
let app: App;
if (!getApps().length) {
    const serviceAccountConfig = process.env.FIREBASE_ADMIN_SDK_CONFIG_BASE64;

    if (!serviceAccountConfig) {
        throw new Error('FIREBASE_ADMIN_SDK_CONFIG_BASE64 environment variable is not set.');
    }

    try {
        const serviceAccountJson = Buffer.from(serviceAccountConfig, 'base64').toString('utf-8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e) {
        console.error("Failed to parse or initialize Firebase Admin SDK credentials.", e);
        throw new Error(`Failed to initialize Firebase Admin SDK. Please check your environment variables.`);
    }
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
