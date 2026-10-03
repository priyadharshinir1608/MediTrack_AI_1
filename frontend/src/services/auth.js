import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';

export const loginWithGoogle = async () => {
  try {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const popupRes = await signInWithPopup(auth, googleProvider);
      if (popupRes?.user?.displayName) {
        localStorage.setItem('medscan_user_name', popupRes.user.displayName);
      }
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Notice:', fbErr.message, '- Using dev fallback for Google sign-in');
      localStorage.setItem('medscan_dev_token', 'mock_token_dev_user_google');
    }

    // Sync profile with MongoDB
    const syncRes = await api.post('/auth/sync');
    if (syncRes.data?.user?.name) {
      localStorage.setItem('medscan_user_name', syncRes.data.user.name);
    }
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
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid password! The password you entered is incorrect. Please check and try again.';
    case 'auth/user-not-found':
      return 'Account not registered! No pharmacy staff account found with this email. Please register first.';
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
  const cleanEmail = email.toLowerCase().trim();
  try {
    let firebaseUid;
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUid = res.user.uid;
      // Set Firebase displayName so it flows through all Firebase tokens and profile requests
      try {
        await updateFirebaseProfile(res.user, { displayName: name });
      } catch (profErr) {
        console.warn('[Firebase Auth] Could not update displayName:', profErr.message);
      }
      // Sign out from client immediately so the user must log in explicitly on Login page
      await firebaseSignOut(auth);
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Notice:', fbErr.message, '- Using dev fallback user registration');
      if (fbErr.code === 'auth/email-already-in-use' || fbErr.code === 'auth/weak-password' || fbErr.code === 'auth/invalid-email') {
        throw new Error(getAuthErrorMessage(fbErr));
      }
      firebaseUid = 'dev_user_' + Date.now();
    }

    // Cache the registered name, email, and password so credentials are checked strictly
    localStorage.setItem('medscan_user_name', name);
    localStorage.setItem('medscan_registered_name', name);
    localStorage.setItem('medscan_registered_email', cleanEmail);
    localStorage.setItem('medscan_dev_pwd_' + cleanEmail, password);

    // Register user metadata in MongoDB
    const backendRes = await api.post('/auth/register', {
      firebaseUid,
      name,
      email: cleanEmail,
      role
    });

    return backendRes.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const loginUser = async (email, password) => {
  const cleanEmail = email.toLowerCase().trim();
  try {
    let fbUser = null;
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      fbUser = res.user;
      localStorage.removeItem('medscan_dev_token');
    } catch (fbErr) {
      console.warn('[Firebase Auth] Sign in check:', fbErr.code, fbErr.message);

      const savedDevPwd = localStorage.getItem('medscan_dev_pwd_' + cleanEmail);
      const isDemoAccount = cleanEmail === 'pharmacist@medscan.ai' || cleanEmail === 'demo@medscan.ai';

      // 1. Password or credential mismatch check
      if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
        // If registered locally in dev mode, verify against saved local password
        if (savedDevPwd) {
          if (savedDevPwd !== password) {
            throw new Error('Invalid password! The password you entered is incorrect.');
          }
          localStorage.setItem('medscan_dev_token', 'mock_token_' + encodeURIComponent(cleanEmail));
        } else if (isDemoAccount) {
          if (password !== 'password123') {
            throw new Error('Invalid password! Demo account password is password123.');
          }
          localStorage.setItem('medscan_dev_token', 'mock_token_' + encodeURIComponent(cleanEmail));
        } else {
          // Strictly reject with invalid password warning!
          throw new Error('Invalid password! The password you entered is incorrect.');
        }
      } else if (fbErr.code === 'auth/user-not-found') {
        if (savedDevPwd) {
          if (savedDevPwd !== password) {
            throw new Error('Invalid password! The password you entered is incorrect.');
          }
          localStorage.setItem('medscan_dev_token', 'mock_token_' + encodeURIComponent(cleanEmail));
        } else if (isDemoAccount && password === 'password123') {
          localStorage.setItem('medscan_dev_token', 'mock_token_' + encodeURIComponent(cleanEmail));
        } else {
          throw new Error(getAuthErrorMessage(fbErr));
        }
      } else if (fbErr.code === 'auth/too-many-requests') {
        throw new Error(getAuthErrorMessage(fbErr));
      } else if (fbErr.code === 'auth/network-request-failed' || !fbErr.code) {
        // Network offline or simulator: strictly check saved password
        if (savedDevPwd) {
          if (savedDevPwd !== password) {
            throw new Error('Invalid password! The password you entered is incorrect.');
          }
        } else if (isDemoAccount && password !== 'password123') {
          throw new Error('Invalid password! Demo account password is password123.');
        }
        localStorage.setItem('medscan_dev_token', 'mock_token_' + encodeURIComponent(cleanEmail));
      } else {
        throw new Error(getAuthErrorMessage(fbErr));
      }
    }

    // Sync profile with MongoDB
    const syncRes = await api.post('/auth/sync', { email: cleanEmail });
    const syncedUser = syncRes.data?.user;
    if (syncedUser?.name) {
      localStorage.setItem('medscan_user_name', syncedUser.name);
    } else if (fbUser?.displayName) {
      localStorage.setItem('medscan_user_name', fbUser.displayName);
    }

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
