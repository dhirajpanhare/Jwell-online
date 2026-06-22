const authService = require('../services/authService');
const logger = require('../utils/logger');

// Validation helpers
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Register user with email, mobile, and password
 * POST /api/v1.0/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, phoneNumber, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName) {
      return res.status(400).json({
        status: false,
        message: 'Email, password, and first name are required',
      });
    }

    // Email validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format',
      });
    }

    const result = await authService.registerUser(
      email,
      password,
      phoneNumber,
      firstName,
      lastName
    );

    logger.info(`[Auth] User registered: ${email}`);

    res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    logger.error('[Auth Register Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Login with email/mobile and password
 * POST /api/v1.0/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({
        status: false,
        message: 'Email/Mobile and password are required',
      });
    }

    const result = await authService.loginUser(emailOrMobile, password);

    logger.info(`[Auth] User logged in: ${emailOrMobile}`);

    res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    logger.error('[Auth Login Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Send email verification OTP
 * POST /api/v1.0/auth/send-otp
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format',
      });
    }

    const result = await authService.sendEmailVerificationOTP(email);

    logger.info(`[Auth] Email verification OTP sent to: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth SendOTP Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Verify email OTP
 * POST /api/v1.0/auth/verify-email-otp
 */
exports.verifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: false,
        message: 'Email and OTP are required',
      });
    }

    const result = await authService.verifyEmailOTP(email, otp);

    logger.info(`[Auth] Email verified for: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    logger.error('[Auth VerifyEmailOTP Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Send password reset OTP
 * POST /api/v1.0/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format',
      });
    }

    const result = await authService.sendPasswordResetOTP(email);

    logger.info(`[Auth] Password reset OTP request for: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth ForgotPassword Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Verify password reset OTP
 * POST /api/v1.0/auth/verify-reset-otp
 */
exports.verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: false,
        message: 'Email and OTP are required',
      });
    }

    const result = await authService.verifyPasswordResetOTP(email, otp);

    logger.info(`[Auth] Password reset OTP verified for: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth VerifyResetOTP Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Reset password with OTP verification
 * POST /api/v1.0/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Email and new password are required',
      });
    }

    const result = await authService.resetPassword(email, newPassword);

    logger.info(`[Auth] Password reset for: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth ResetPassword Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Change password (authenticated user)
 * POST /api/v1.0/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Old password and new password are required',
      });
    }

    const result = await authService.changePassword(userId, oldPassword, newPassword);

    logger.info(`[Auth] Password changed for userId: ${userId}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth ChangePassword Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Resend OTP
 * POST /api/v1.0/auth/resend-otp
 */
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required',
      });
    }

    const result = await authService.sendEmailVerificationOTP(email);

    logger.info(`[Auth] OTP resent to: ${email}`);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('[Auth ResendOTP Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Get current user (authenticated)
 * GET /api/v1.0/auth/me
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const result = await authService.getUserById(userId);

    res.status(200).json({
      status: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('[Auth GetUser Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};

/**
 * Update user profile (authenticated)
 * PUT /api/v1.0/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    const result = await authService.updateUserProfile(userId, req.body);

    logger.info(`[Auth] Profile updated for userId: ${userId}`);

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: result.data,
    });
  } catch (error) {
    logger.error('[Auth UpdateProfile Error]', error);
    
    if (error.status) {
      return res.status(error.status).json({
        status: false,
        message: error.message,
      });
    }
    
    next(error);
  }
};
