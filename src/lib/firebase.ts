// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "shopwave-6mh7a",
  "appId": "1:800300007748:web:627f0cb6d09321d989d711",
  "storageBucket": "shopwave-6mh7a.firebasestorage.app",
  "apiKey": "AIzaSyAvD2Tz2nEYI80Ni4Po2mKjDdepNwsNJxU",
  "authDomain": "shopwave-6mh7a.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "800300007748"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };

    