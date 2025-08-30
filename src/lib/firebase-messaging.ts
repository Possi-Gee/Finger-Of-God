
'use client';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return 'denied';
    }

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        console.log('Notification permission granted.');
        try {
            // NOTE: This VAPID key is a placeholder and should be generated for your project.
            // You can generate one in the Firebase Console under Project Settings > Cloud Messaging > Web configuration.
            const currentToken = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' });
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                // TODO: Send this token to your server to subscribe the user to notifications
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    }
    return permission;
};


export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});

