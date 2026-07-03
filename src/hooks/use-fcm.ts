'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase/client';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './use-auth';

export function useFcm() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const requestPermission = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermissionStatus(permission);

        if (permission === 'granted') {
          const messaging = getMessaging(app);
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;

          if (!vapidKey) {
            throw new Error("NEXT_PUBLIC_VAPID_KEY is not defined in your environment variables.");
          }

          const currentToken = await getToken(messaging, { vapidKey });

          if (currentToken) {
            setFcmToken(currentToken);
            
            // Save token to Firestore if user is logged in
            if (user) {
              const tokenRef = doc(db, 'fcmTokens', currentToken);
              await setDoc(tokenRef, {
                token: currentToken,
                userId: user.uid,
                updatedAt: serverTimestamp(),
                deviceInfo: navigator.userAgent
              }, { merge: true });
            } else {
               // Save anonymously
               const tokenRef = doc(db, 'fcmTokens', currentToken);
               await setDoc(tokenRef, {
                 token: currentToken,
                 updatedAt: serverTimestamp(),
                 deviceInfo: navigator.userAgent
               }, { merge: true });
            }
            
            return currentToken;
          } else {
            console.log('No registration token available. Request permission to generate one.');
            setError('No registration token available.');
          }
        } else {
          console.log('Unable to get permission to notify.');
          setError('Permission denied.');
        }
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      setError((err as Error).message);
    }
    return null;
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermissionStatus(Notification.permission);
      
      // Auto-request permission on mount/login if not decided yet
      if (user && Notification.permission === 'default') {
        requestPermission();
      }
    }
  }, [user, requestPermission]);

  // Optional: Listen for foreground messages
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && notificationPermissionStatus === 'granted') {
       try {
           const messaging = getMessaging(app);
           const unsubscribe = onMessage(messaging, (payload) => {
             console.log('Message received in foreground: ', payload);
             // You can customize foreground notification behavior here
             // e.g., show a toast or a custom in-app banner
             if (payload.notification) {
                 new Notification(payload.notification.title || 'Notification', {
                     body: payload.notification.body,
                     icon: payload.notification.icon || '/icon.png'
                 });
             }
           });
           return () => unsubscribe();
       } catch (e) {
           console.log("Messaging not supported or blocked", e);
       }
    }
  }, [notificationPermissionStatus]);

  return {
    fcmToken,
    notificationPermissionStatus,
    requestPermission,
    error,
  };
}
