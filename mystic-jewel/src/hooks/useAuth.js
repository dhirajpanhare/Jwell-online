import { useState, useCallback } from 'react';
import {
  registerUser, loginUser, sendOtp, resendOtp,
  verifyEmailOtp, sendPasswordResetOtp, verifyPasswordResetOtp,
  resetPassword, changePassword, logout,
  getCurrentUser, getAuthToken, isAuthenticated,
} from '../api/authApi';

export const useAuth = () => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  const registerNewUser = useCallback(async (email, password, phoneNumber, firstName, lastName = '') => {
    setIsLoading(true); setError(null);
    try {
      const response = await registerUser(email, password, phoneNumber, firstName, lastName);
      if (response.data?.user) setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to register';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const login = useCallback(async (emailOrMobile, password) => {
    setIsLoading(true); setError(null);
    try {
      const response = await loginUser(emailOrMobile, password);
      const userData = response.data?.user;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to login';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const sendEmailVerificationOTP = useCallback(async (email) => {
    setIsLoading(true); setError(null);
    try {
      await sendOtp(email);
      setOtpSent(true); setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const resendEmailOTP = useCallback(async (email) => {
    setIsLoading(true); setError(null);
    try {
      await resendOtp(email);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const verifyEmailOTPCode = useCallback(async (email, otp) => {
    setIsLoading(true); setError(null);
    try {
      const response = await verifyEmailOtp(email, otp);
      const userData = response.data?.user;
      setUser(userData); setOtpSent(false); setOtpEmail('');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const sendResetOTP = useCallback(async (email) => {
    setIsLoading(true); setError(null);
    try {
      await sendPasswordResetOtp(email);
      setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reset OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const verifyResetOTPCode = useCallback(async (email, otp) => {
    setIsLoading(true); setError(null);
    try {
      await verifyPasswordResetOtp(email, otp);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const resetPasswordFunc = useCallback(async (email, newPassword) => {
    setIsLoading(true); setError(null);
    try {
      await resetPassword(email, newPassword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const changePasswordFunc = useCallback(async (oldPassword, newPassword) => {
    setIsLoading(true); setError(null);
    try {
      await changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      setError(msg);
      return { success: false, error: msg };
    } finally { setIsLoading(false); }
  }, []);

  const logoutUser = useCallback(() => {
    logout();
    setUser(null); setOtpSent(false); setOtpEmail('');
  }, []);

  return {
    user, setUser, isLoading, error, otpSent, otpEmail,
    registerNewUser, login, sendEmailVerificationOTP, resendEmailOTP,
    verifyEmailOTPCode, sendResetOTP, verifyResetOTPCode,
    resetPasswordFunc, changePasswordFunc, logoutUser,
    isAuthenticated: !!user || isAuthenticated(),
    token: getAuthToken(),
  };
};

export default useAuth;
