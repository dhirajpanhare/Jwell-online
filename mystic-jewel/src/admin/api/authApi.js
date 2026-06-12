import axiosInstance from './axiosInstance';

/**
 * Send OTP to admin email
 */
export const sendOtp = async (email) => {
  try {
    const response = await axiosInstance.post(
      import.meta.env.VITE_SEND_OTP_ENDPOINT,
      { email }
    );

    if (response.data?.status === true) {
      return response.data;
    }

    throw new Error(response.data?.message || 'Failed to send OTP');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP and get JWT token
 */
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post(
      import.meta.env.VITE_VERIFY_OTP_ENDPOINT,
      { email, otp }
    );

    if (response.data?.status === true) {
      const { token, user } = response.data.data;

      // Store in admin-specific keys
      localStorage.setItem('adminAuthToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      return response.data;
    }

    throw new Error(response.data?.message || 'Failed to verify OTP');
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Logout admin
 */
export const adminLogout = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminUser');
};

/**
 * Get current admin user
 */
export const getAdminUser = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('adminAuthToken');
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = () => {
  return !!localStorage.getItem('adminAuthToken');
};

export default {
  sendOtp,
  verifyOtp,
  adminLogout,
  getAdminUser,
  getAuthToken,
  isAdminAuthenticated,
};
