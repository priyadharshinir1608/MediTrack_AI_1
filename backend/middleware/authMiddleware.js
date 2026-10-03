const mongoose = require('mongoose');
const { admin, firebaseInitialized } = require('../config/firebase');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    let decodedToken;
    const isProduction = process.env.NODE_ENV === 'production';

    if (idToken.startsWith('mock_token_')) {
      if (isProduction) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Mock tokens disabled in production' });
      }
      const rawTokenVal = idToken.replace('mock_token_', '');
      let tokenEmail = 'pharmacist@medscan.ai';
      try {
        tokenEmail = decodeURIComponent(rawTokenVal);
      } catch (_) {
        tokenEmail = rawTokenVal;
      }
      decodedToken = { uid: 'mock_' + tokenEmail, email: tokenEmail, name: 'Pharmacist' };
    } else if (firebaseInitialized) {
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (tokenErr) {
        console.warn('[Auth Middleware] Firebase ID Token verify warning:', tokenErr.message);
        if (isProduction) {
          return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
        }
        decodedToken = { uid: 'dev_user_fallback', email: 'user@medscan.ai', name: 'Pharmacist User' };
      }
    } else {
      if (isProduction) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Firebase authentication required' });
      }
      decodedToken = { uid: idToken, email: 'demo@medscan.ai', name: 'Demo User' };
    }

    req.firebaseUser = decodedToken;

    // Attach MongoDB user if connected (non-blocking fallback prevents event loop freezes)
    let dbUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        dbUser = await User.findOne({ firebaseUid: decodedToken.uid }).maxTimeMS(2500);
        if (!dbUser && decodedToken.email) {
          dbUser = await User.findOne({ email: decodedToken.email }).maxTimeMS(2500);
        }
      } catch (dbErr) {
        // Soft fallback to token identity without blocking request flow
      }
    }

    req.user = dbUser || {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email || 'user@medscan.ai',
      name: decodedToken.name || 'Staff User',
      role: 'pharmacist'
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
};

module.exports = {
  verifyToken,
  requireAdmin
};
