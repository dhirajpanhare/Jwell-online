/**
 * Authentication Routes
 * Handles user registration, login, OTP verification, password reset, and profile management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, message: errors.array()[0].msg });
  }
  next();
};

// Validation rules
const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('phoneNumber').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number'),
];

const loginRules = [
  body('emailOrMobile').trim().notEmpty().withMessage('Email or mobile is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const emailRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

const otpRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 4, max: 8 }).isNumeric().withMessage('Valid OTP required'),
];

const resetPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const changePasswordRules = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

/**
 * Public routes
 */
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/send-otp', emailRules, validate, authController.sendOtp);
router.post('/verify-email-otp', otpRules, validate, authController.verifyEmailOtp);
router.post('/resend-otp', emailRules, validate, authController.resendOtp);
router.post('/forgot-password', emailRules, validate, authController.forgotPassword);
router.post('/verify-reset-otp', otpRules, validate, authController.verifyResetOtp);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

/**
 * Protected routes
 */
router.get('/me', verifyAuth, authController.getCurrentUser);
router.put('/profile', verifyAuth, authController.updateProfile);
router.post('/change-password', verifyAuth, changePasswordRules, validate, authController.changePassword);

module.exports = router;
