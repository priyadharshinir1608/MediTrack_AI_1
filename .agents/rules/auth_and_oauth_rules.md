# Auth & OAuth Rules for MedScan AI

## 1. Google OAuth Explicit Account Consent
When the user clicks **Continue with Google**, the application must force the Google account selection screen (`prompt: "select_account"`) before authentication proceeds, ensuring explicit user consent rather than silently reusing a previously cached account.

```text
Click Continue with Google
          ↓
Google popup opens
          ↓
Choose an account
          ↓
User explicitly selects account
          ↓
Firebase Authentication
          ↓
Login successful
```

```javascript
// frontend/src/services/auth.js
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export const loginWithGoogle = async () => {
  try {
    const googleProvider = new GoogleAuthProvider();

    // Force the Google account selection screen
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Login only after user selects an account
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Login Error:', error.message);
    throw error;
  }
};
```

## 2. Environment-Aware Token Verification Guardrail
Check synthetic `mock_token_` tokens before Firebase JWT verification only in development mode (`NODE_ENV !== 'production'`). In production, always require a valid Firebase ID token and return `401 Unauthorized` for any invalid, expired, or synthetic token.

## 3. Data Separation Matrix

| Action | System Responsible |
|---|---|
| Account selection | Google OAuth popup |
| User authentication | Firebase Authentication |
| Password / Google credentials | Google + Firebase |
| Application profile & role | MongoDB Atlas |
| Sign-in activity & audit logs | Firebase Firestore |
