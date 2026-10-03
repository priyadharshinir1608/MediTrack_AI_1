import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';

export const loginWithGoogle = async () => {
  try {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Notice:', fbErr.message, '- Using dev fallback for Google sign-in');
      localStorage.setItem('medscan_dev_token', 'mock_token_dev_user_google');
    }

    // Sync profile with MongoDB
    const syncRes = await api.post('/auth/sync');
    return syncRes.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * Translate Firebase error codes into clear, user-friendly instructions
 */
export const getAuthErrorMessage = (error) => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'Account not registered! No pharmacy staff account found with this email. Please register first.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password! If you have not registered yet, please create an account first.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g. pharmacist@medscan.ai).';
    case 'auth/email-already-in-use':
      return 'This email address is already registered! Please sign in with your password.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This pharmacy staff account has been deactivated. Please contact your system administrator.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access is temporarily restricted. Please wait a few moments before trying again.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was cancelled before completion.';
    default:
      return error?.message || 'Authentication failed. Please verify your credentials.';
  }
};

export const registerUser = async (name, email, password, role = 'pharmacist') => {
  try {
    // 1. Create account strictly in Firebase Auth
    let res;
    try {
      res = await createUserWithEmailAndPassword(auth, email, password);
    } catch (fbErr) {
      const friendlyMsg = getAuthErrorMessage(fbErr);
      const customErr = new Error(friendlyMsg);
      customErr.code = fbErr.code || 'auth/registration-failed';
      throw customErr;
    }

    const firebaseUid = res.user.uid;
    // Sign out from client immediately so the user must log in explicitly on Login page
    await firebaseSignOut(auth);
    localStorage.removeItem('medscan_dev_token');

    // 2. Register user metadata in MongoDB
    const backendRes = await api.post('/auth/register', {
      firebaseUid,
      name,
      email,
      role
    });

    return backendRes.data;
  } catch (err) {
    throw err;
  }
};

export const loginUser = async (email, password) => {
  try {
    // 1. Authenticate credentials strictly against Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      // STRICT: Never allow unregistered users to log in!
      console.warn('[Firebase Auth] Login rejected:', fbErr.code, fbErr.message);
      const friendlyMsg = getAuthErrorMessage(fbErr);
      const customErr = new Error(friendlyMsg);
      customErr.code = fbErr.code || 'auth/invalid-credential';
      throw customErr;
    }

    // 2. Sync profile with MongoDB
    const syncRes = await api.post('/auth/sync');
    return syncRes.data;
  } catch (err) {
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    // Ignore error in fallback mode
  }
  localStorage.removeItem('medscan_dev_token');
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset link sent to your email.' };
  } catch (err) {
    throw new Error(err.message);
  }
};
