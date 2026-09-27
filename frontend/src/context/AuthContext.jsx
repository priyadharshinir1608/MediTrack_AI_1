import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginUser, registerUser, logoutUser, loginWithGoogle } from '../services/auth';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
        } catch (err) {
          setUser({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Pharmacy Staff',
            role: 'pharmacist'
          });
        }
      } else {
        const mockToken = localStorage.getItem('medscan_dev_token');
        if (mockToken) {
          try {
            const res = await api.get('/auth/profile');
            setUser(res.data.user);
          } catch (err) {
            setUser({
              firebaseUid: 'dev_user_demo',
              email: 'demo@medscan.ai',
              name: 'Demo Pharmacist',
              role: 'pharmacist'
            });
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const data = await loginWithGoogle();
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await registerUser(name, email, password, role);
      setUser(null);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, loginWithGoogle: loginGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
