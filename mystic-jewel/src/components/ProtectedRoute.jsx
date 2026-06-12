import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../api/authApi';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!getAuthToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
