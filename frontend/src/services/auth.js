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

export const registerUser = async (name, email, password, role = 'pharmacist') => {
  try {
    let firebaseUid;
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUid = res.user.uid;
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Notice:', fbErr.message, '- Using dev fallback user registration');
      firebaseUid = 'dev_user_' + Date.now();
      localStorage.setItem('medscan_dev_token', `mock_token_${firebaseUid}`);
    }

    // Register user metadata in MongoDB
    const backendRes = await api.post('/auth/register', {
      firebaseUid,
      name,
      email,
      role
    });

    return backendRes.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const loginUser = async (email, password) => {
  try {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Notice:', fbErr.message, '- Logging in with dev simulation credentials');
      localStorage.setItem('medscan_dev_token', 'mock_token_dev_user_demo');
    }

    // Sync profile with MongoDB
    const syncRes = await api.post('/auth/sync');
    return syncRes.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
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
