import authAxiosInstance from './authAxiosInstance';

/**
 * In-memory and session storage token store
 * Token is persisted to sessionStorage for XSS protection (XSS can't access HttpOnly cookies)
 * Session is restored on page refresh by retrieving token from sessionStorage
 */
let _accessToken = (() => {
  // Try to restore token from sessionStorage on module load
  try {
    const stored = sessionStorage.getItem('authToken');
    return stored ? stored : null;
  } catch (_) {
    return null;
  }
})();

export const setAccessToken = (token) => {
  _accessToken = token;
  // Persist to sessionStorage
  try {
    if (token) {
      sessionStorage.setItem('authToken', token);
    } else {
      sessionStorage.removeItem('authToken');
    }
  } catch (_) {}
};

export const getAuthToken = () => _accessToken;

export const isAuthenticated = () => !!_accessToken;

/**
 * Persist non-sensitive user profile to sessionStorage only (not token).
 */
const persistUser = (user) => {
  try { sessionStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
};

const clearUser = () => {
  try { sessionStorage.removeItem('user'); } catch (_) {}
};

export const getCurrentUser = () => {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

/** Register new user */
export const registerUser = async (email, password, phoneNumber, firstName, lastName = '') => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_REGISTER_ENDPOINT,
    { email, password, phoneNumber, firstName, lastName }
  );

  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to register');
};

/** Login with email/mobile and password */
export const loginUser = async (emailOrMobile, password) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_LOGIN_ENDPOINT,
    { emailOrMobile, password }
  );

  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to login');
};

/** Send email verification OTP */
export const sendOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_SEND_OTP_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to send OTP');
};

/** Resend OTP */
export const resendOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_RESEND_OTP_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to resend OTP');
};

/** Verify email OTP */
export const verifyEmailOtp = async (email, otp) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_VERIFY_EMAIL_OTP_ENDPOINT,
    { email, otp }
  );
  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to verify OTP');
};

/** Send password reset OTP */
export const sendPasswordResetOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_FORGOT_PASSWORD_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to send reset OTP');
};

/** Verify password reset OTP */
export const verifyPasswordResetOtp = async (email, otp) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_VERIFY_RESET_OTP_ENDPOINT,
    { email, otp }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to verify OTP');
};

/** Reset password */
export const resetPassword = async (email, newPassword) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_RESET_PASSWORD_ENDPOINT,
    { email, newPassword }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to reset password');
};

/** Change password (authenticated) */
export const changePassword = async (oldPassword, newPassword) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_CHANGE_PASSWORD_ENDPOINT,
    { oldPassword, newPassword }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to change password');
};

/** Logout — clear in-memory token and sessionStorage */
export const logout = () => {
  setAccessToken(null); // This clears both memory and sessionStorage
  clearUser();
};

export default {
  registerUser, loginUser, sendOtp, resendOtp, verifyEmailOtp,
  sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword,
  changePassword, logout, getCurrentUser, getAuthToken, isAuthenticated,
};
