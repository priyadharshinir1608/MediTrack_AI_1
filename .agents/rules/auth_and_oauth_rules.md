# Auth & OAuth Rules for MedScan AI

## 1. Google OAuth Account Selection Rule
Configure `GoogleAuthProvider` with `prompt: 'select_account'` before `signInWithPopup()` when the application requires users to explicitly choose their Google account, requesting Google to show the account-selection screen instead of silently reusing the current Google session.

```javascript
// frontend/src/services/auth.js
googleProvider.setCustomParameters({ prompt: 'select_account' });
await signInWithPopup(auth, googleProvider);
```

## 2. Environment-Aware Token Verification Guardrail
Check synthetic `mock_token_` tokens before Firebase JWT verification only in development mode (`NODE_ENV !== 'production'`). In production, always require a valid Firebase ID token and return `401 Unauthorized` for any invalid, expired, or synthetic token.

## 3. Data Separation Matrix
- **Firebase Authentication**: Handles identity, credentials, Google sign-in, and UIDs. Never store passwords in MongoDB.
- **MongoDB Atlas**: Stores pharmacy operational entities (`medicines`, `suppliers`, `sales`, `purchases`) and user roles (`firebaseUid`, `name`, `email`, `role`).
- **Firebase Firestore**: Stores real-time `notifications` and `activityLogs`.
