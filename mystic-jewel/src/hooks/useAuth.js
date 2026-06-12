import { useState, useCallback } from 'react';
import { sendOtp, verifyOtp, logout, getCurrentUser, getAuthToken, isAuthenticated } from '../api/authApi';

/**
 * Custom hook for authentication management
 * Handles OTP flow and session persistence
 */
export const useAuth = () => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  /**
   * Send OTP to email
   */
  const sendOTPEmail = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verify OTP and authenticate
   */
  const verifyOTPCode = useCallback(async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyOtp(email, otp);
      const userData = response.data?.user;
      setUser(userData);
      setOtpSent(false);
      setOtpEmail('');
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logoutUser = useCallback(() => {
    logout();
    setUser(null);
    setOtpSent(false);
    setOtpEmail('');
  }, []);

  /**
   * Check if user is authenticated
   */
  const checkAuth = useCallback(() => {
    return isAuthenticated();
  }, []);

  return {
    user,
    setUser,
    isLoading,
    error,
    otpSent,
    otpEmail,
    sendOTPEmail,
    verifyOTPCode,
    logoutUser,
    checkAuth,
    isAuthenticated: !!user || isAuthenticated(),
    token: getAuthToken(),
  };
};

export default useAuth;
