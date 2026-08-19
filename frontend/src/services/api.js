import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to auto-attach Firebase ID token to request headers
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback dev token if logged in via dev simulation
      const mockToken = localStorage.getItem('medscan_dev_token');
      if (mockToken) {
        config.headers.Authorization = `Bearer ${mockToken}`;
      }
    }
  } catch (err) {
    console.warn('[API Interceptor] Could not fetch token:', err.message);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
