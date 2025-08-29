
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { app } from './firebase'; // Use the initialized app

// Caches the messaging instance
let messaging: any = null;

export const getMessagingInstance = async () => {
    const supported = await isSupported();
    if (supported && !messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
};


// Function to request permission and get token
export const requestNotificationPermission = async () => {
    try {
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) {
            console.log("Firebase Messaging is not supported in this browser.");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const token = await getToken(messagingInstance, { 
                vapidKey: 'BOWBmbyjkOMXfuzFtb-8u2J16pyUQJeWzhq7kr3U5JGN7-WvZxD85o0pybkzHl8HFzsyeKV3OKE32gR8SEAKTK4'
            });
            
            if (token) {
                console.log('FCM Token:', token);
                return token;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while requesting permission:', error);
        return null;
    }
};
