import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const fallbackAuthContext = {
  user: null,
  setUser: () => {},
  loading: true,
  login: async () => {
    throw new Error('Auth context is not ready yet.');
  },
  register: async () => {
    throw new Error('Auth context is not ready yet.');
  },
  logout: async () => {}
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return fallbackAuthContext;
  }
  return context;
};

export default useAuth;
