import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDHM4xffvC5UaIMqmjr95UXksUs5aL5WG8",
  authDomain: "meditrack-ai-69dee.firebaseapp.com",
  projectId: "meditrack-ai-69dee",
  storageBucket: "meditrack-ai-69dee.firebasestorage.app",
  messagingSenderId: "286542089959",
  appId: "1:286542089959:web:d8e6ac7eb6a18a4d975c42",
  measurementId: "G-ZFGQP9G0GN"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Safe Messaging Initialization (Checks browser compatibility + Service Worker availability)
const messaging = isSupported().then((supported) => {
  return supported && typeof window !== "undefined" ? getMessaging(app) : null;
}).catch(() => null);

// Analytics initialization for browser environment
let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn("[Firebase Analytics] Warning:", err.message);
  }
}

export { app, auth, db, analytics, googleProvider, messaging, firebaseConfig };
export default app;
