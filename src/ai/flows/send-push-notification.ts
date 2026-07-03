
'use server';

/**
 * @fileOverview Sends push notifications to all subscribed users.
 * - sendPushNotification: A function that handles sending the notification.
 * - PushNotificationInput: Input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

// Initialize Firebase Admin SDK with a unique name to avoid conflicts
const adminAppName = 'firebase-admin-app-deshexam';
let adminApp: App;

if (!getApps().some(app => app.name === adminAppName)) {
    const serviceAccount = JSON.parse(process.env.GCP_SA_KEY || '{}');
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    adminApp = initializeApp({
        credential: cert(serviceAccount),
    }, adminAppName);
} else {
  adminApp = getApps().find(app => app.name === adminAppName)!;
}

const db = getFirestore(adminApp);

const PushNotificationInputSchema = z.object({
  title: z.string().describe('The title of the notification.'),
  body: z.string().describe('The main message content of the notification.'),
  link: z.string().url().optional().describe('The URL to open when the notification is clicked.'),
  imageUrl: z.string().url().optional().describe('The URL of the banner image to show in the notification.'),
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
  async ({ title, body, link, imageUrl }) => {
    try {
      const tokensSnapshot = await db.collection('fcmTokens').get();
      if (tokensSnapshot.empty) {
        console.log('No tokens found to send notifications.');
        return;
      }

      const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(Boolean);
      
      if (tokens.length === 0) {
        console.log('No valid tokens found.');
        return;
      }

      const message = {
        notification: {
          title,
          body,
          imageUrl,
        },
        webpush: {
          fcm_options: {
            link: link || 'https://deshexam.com',
          },
          notification: {
            icon: '/icon.png',
            image: imageUrl,
          },
        },
        tokens: tokens,
      };

      const response = await getMessaging(adminApp).sendEachForMulticast(message as any);
      console.log(`${response.successCount} messages were sent successfully`);

      // Save campaign history
      const { FieldValue } = await import('firebase-admin/firestore');
      await db.collection('pushCampaigns').add({
        title,
        body,
        type: 'Push',
        audience: tokens.length,
        sentCount: response.successCount,
        failedCount: response.failureCount,
        status: 'Sent',
        createdAt: FieldValue.serverTimestamp(),
      });

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
