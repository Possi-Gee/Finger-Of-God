
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
            // TODO: Get the token here and return it
            const token = await getToken(messaging, { 
                vapidKey: 'YOUR_VAPID_KEY_HERE' // IMPORTANT: Replace with your actual VAPID key
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
