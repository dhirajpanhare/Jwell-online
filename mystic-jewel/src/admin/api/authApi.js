import axiosInstance from './axiosInstance';
import { setAccessToken, getAuthToken } from '../../api/authApi';

/**
 * Admin auth uses the same in-memory token store as the main app.
 * Tokens are NEVER written to localStorage.
 */

export const sendOtp = async (email) => {
  const response = await axiosInstance.post(
    import.meta.env.VITE_SEND_OTP_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to send OTP');
};

export const verifyOtp = async (email, otp) => {
  const response = await axiosInstance.post(
    import.meta.env.VITE_VERIFY_EMAIL_OTP_ENDPOINT,
    { email, otp }
  );
  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) {
      try { sessionStorage.setItem('adminUser', JSON.stringify(user)); } catch (_) {}
    }
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to verify OTP');
};

export const adminLogout = () => {
  setAccessToken(null);
  try { sessionStorage.removeItem('adminUser'); } catch (_) {}
};

export const getAdminUser = () => {
  try {
    const raw = sessionStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

export { getAuthToken };

export const isAdminAuthenticated = () => !!getAuthToken();

export default { sendOtp, verifyOtp, adminLogout, getAdminUser, getAuthToken, isAdminAuthenticated };
