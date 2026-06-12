import axiosInstance from './axiosInstance';

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @returns {Promise<object>} Response with OTP details
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
 * Verify OTP and get authentication token
 * @param {string} email - User's email address
 * @param {string} otp - OTP received by user
 * @returns {Promise<object>} Response with JWT token and user data
 */
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axiosInstance.post(
      import.meta.env.VITE_VERIFY_OTP_ENDPOINT,
      { email, otp }
    );
    
    if (response.data?.status === true) {
      const { token, user } = response.data.data;
      
      // Store token and user in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to verify OTP');
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 * @returns {object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

export default {
  sendOtp,
  verifyOtp,
  logout,
  getCurrentUser,
  getAuthToken,
  isAuthenticated,
};
