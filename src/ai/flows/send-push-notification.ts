
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

// Correctly format the service account credentials to avoid parsing errors.
const serviceAccount = {
  "type": "service_account",
  "project_id": "studio-8356746366-699c1",
  "private_key_id": "7da97ffe20a44b66d4a2256be7dc2e8ad6c50915",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBUenx4hAEofyH\n/gcdRKtdAUpTsuYjoYS/9vdPA7Q1n6Mg9H8AgWIjNTI724zsA+abaN+ygVn//ah8\nBnK+YJ81rMvihzRH1Q60k27jLw5n12CCzWxPUwmYtNmJdbFddioN614O04vr/sJW\nbF0ntr+ybCUJZ5tJuaEYDTrcQiYVUfH5kxG2Yy2txm4mDdAi+KOnNP1ow5ySuGc6\n439nPPGTWXyADV45I4OVmbaOq3/cnVu9/HC4BZCaRK60s2wT+bDdOMTt7TVB+Hq2\n0QAmutef8t50bkHJfNrDwMEqBbOkzcVRtmKqBqO+v7+BLZgv0UD6rp0HrvPP0Pk9\noZYv1NU1AgMBAAECggEAVq3s0HjFJ96dxTggZn4ou83dTsQTLny4cf5BCxulDLok\nQZ1+6HIa16B9gptBh32EQ8B1NKuM+Bv7FIkrn7LhEAcHb+2hgmfEbTEB8jliIytN\n6bhDzRl1XxQPyfOMcFSQLKeRB+LQhSM4bdmutyTYtR6KSLo8xYTG92rPLn02aC4L\nS3w7ER/1nLaXeBKu0UAuwZpojrVYeAOboHYa+jFyCArLHd8v48vaiOzvWTc77VMK\nX20OYEQ4vLeExNtiXvYh+5MkS/IEpZQ1GBwp9ZH0RbGZXRtuzg8emjRff5s9Ckqz\n7dGH0rSlcIDt/4AVuDUQMWuuJt+j2Q9ELPnsG1YPjQKBgQDmbpTP+aUiJYaUe2Wj\nMlMKooQ0udlnwq0gXaXUp15As6qlzeoKHPjlWSX5F2geIwe6L5Fibr0yKoWXjsvj\n4qddqLem7nze3vdRvLgVvXdQeg65KdYIU1damFISCEfU6IiLdnQUWK9RROYaSYIV\nHNYmfKLFvZPwXJua/QCZFqMk2wKBgQDWxSq3uEXdxXUoLnMctdUn9PAeRKpAIFda\nPSuV/r184HFC6N0akWEFbkwz9tXqRVUzRtQbH/TxhUEEEM+/F5u5NzH85EfvYWKo\neSZbibL0cTT5dJ0w5vDC+EsmlwYhPxLTWO7rIWC6034hg/fjN2hHIwQ0T4R3D1e3\nngdReJ+DLwKBgQCIUjUhUIw7xj12zAWV5WixKvHRi30tYEMxmZVIV/dviZrT2hyx\n/O/WJsZLNWi4I3snz4pP1DmDWxqLTcQbPfRLeUukqwQeiYOAzIeO/PaAGqVpL3Ha\nnQtZojEzT8jHEQXuk5Yaj1iwWHVUadZWDSg3vpZBK2VA1liL+U8IQhcj7wKBgELN\np2DoB4tY3P03nYSjpn68OGgh0ZcKuEEQX9tTFluecHxwdD3MVJJc4YUUVSt+j2bY\ntCcPxJ/PZA7Ar+3viPeOjJTt6NYzw31F2cGFTk2sXN7u/+nzG5Z5pt6FAVocBV4J\n/p7SjgTuvf/szZE2bdAauzcOONTTx+QMWphj3bHvAoGBAKsLlVagw3JWmM1j1Z3S\nXGcCcSsSZweEv1MkGugPIkKil8K6M9aCIM/LtLP2Jpakic/fwXvhyd3E1FLmWciu\ni562O9G3NcW2/u8QYpvQRd7H+ArV9TiI/5sToiG5rY5c+grb1161LLxBRdCnTMbt\nue4Dcfwh2csj89ouCQ9q5NiQ\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-fbsvc@studio-8356746366-699c1.iam.gserviceaccount.com",
  "client_id": "109571252283045065353",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-8356746366-699c1.iam.gserviceaccount.com",
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
  link: z.string().url().optional().describe('The URL to open when the notification is clicked.'),
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
  async ({ title, body, link }) => {
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
        },
        data: {
            title,
            body,
            link: link || 'https://deshexam.com',
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icon.png',
          },
          fcm_options: {
            link: link || 'https://deshexam.com',
          },
        },
        tokens: tokens,
      };

      const response = await getMessaging(app).sendEachForMulticast(message as any);
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
