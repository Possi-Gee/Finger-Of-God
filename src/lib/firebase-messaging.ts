
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from './firebase'; // Use the initialized app

// Get a messaging instance
const messaging = getMessaging(app);

// Function to request permission and get token
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            const token = await getToken(messaging, { 
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
        // We don't need to re-throw, null is a clear indicator of failure.
        return null;
    }
};
