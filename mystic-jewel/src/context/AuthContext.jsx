import { createContext, useContext, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  // Persist auth state
  useEffect(() => {
    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
    }
  }, [auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
