const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const env = require("./env");

let firestore = null;
let firebaseInitialized = false;

const configuredServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountPath = configuredServiceAccountPath
  ? (path.isAbsolute(configuredServiceAccountPath)
    ? configuredServiceAccountPath
    : path.resolve(process.cwd(), configuredServiceAccountPath))
  : path.join(__dirname, "serviceAccountKey.json");

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    firestore = admin.firestore();
    firebaseInitialized = true;
    console.log("[Firebase Admin] Initialized successfully with Service Account Key.");
  } else {
    console.warn("[Firebase Admin] serviceAccountKey.json not found at:", serviceAccountPath);
    console.warn("[Firebase Admin] Running in Mock/Development fallback mode.");
    console.warn("[Firebase Admin] To enable Firestore, download your Service Account Key from:");
    console.warn("  Firebase Console → Project Settings → Service Accounts → Generate New Private Key");
    console.warn("  Save it as: backend/config/serviceAccountKey.json");
    console.warn("  Or set FIREBASE_SERVICE_ACCOUNT_PATH to the JSON file location.");
  }
} catch (err) {
  console.warn("[Firebase Admin] Init warning:", err.message);
  console.warn("[Firebase Admin] Running in Mock/Development fallback mode.");
}

module.exports = {
  admin,
  firestore,
  firebaseInitialized
};
