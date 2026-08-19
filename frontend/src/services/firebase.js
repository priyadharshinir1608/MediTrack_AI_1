import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
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

// Analytics should only initialize when a real web API key is configured.
let analytics;
if (typeof window !== "undefined" && firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, googleProvider };
