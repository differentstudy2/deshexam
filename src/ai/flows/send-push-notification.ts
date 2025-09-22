
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
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG) {
    throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
  }
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    throw new Error(`Failed to parse FIREBASE_ADMIN_SDK_CONFIG: ${(e as Error).message}`);
  }
}

const db = getFirestore();

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

      const response = await getMessaging().sendEachForMulticast(message);
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
