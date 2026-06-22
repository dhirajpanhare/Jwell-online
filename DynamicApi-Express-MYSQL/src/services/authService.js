const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const emailService = require('./emailService');
const { generateOTP } = require('../utils/procedurePayloadGenerator');

// Fail loudly on startup if JWT_SECRET is not set
const JWT_SECRET = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
};

// JWT_EXPIRY must be a valid number (seconds) or zeit/ms string like '24h', '7d'
// Default: '24h' — never accept bare number string like '86400' (treated as ms in some versions)
const JWT_EXPIRY = () => {
  const expiry = process.env.JWT_EXPIRY;
  if (!expiry) return '24h';
  // If it's a pure number string, treat it as seconds and append 's'
  return /^\d+$/.test(expiry) ? `${expiry}s` : expiry;
};

const validatePasswordStrength = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!regex.test(password)) {
    throw { status: 400, message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' };
  }
};

const validateMobileNumber = (mobile) => {
  const regex = /^[6-9]\d{9}$/;
  if (!regex.test(mobile)) {
    throw { status: 400, message: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9' };
  }
};

const signToken = (user) => jwt.sign(
  { id: user.UserId, email: user.Email, role: user.Role },
  JWT_SECRET(),
  { expiresIn: JWT_EXPIRY() }
);

const formatUser = (user) => ({
  userId: user.UserId,
  email: user.Email,
  phoneNumber: user.PhoneNumber || '',
  firstName: user.FirstName || '',
  lastName: user.LastName || '',
  role: user.Role,
  isEmailVerified: !!user.IsEmailVerified,
});

/**
 * Register user
 */
const registerUser = async (email, password, phoneNumber, firstName, lastName = '') => {
  const connection = await pool.getConnection();
  try {
    validatePasswordStrength(password);
    if (phoneNumber) validateMobileNumber(phoneNumber);

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'CALL SP_RegisterUser(?, ?, ?, ?, ?)',
      [email, hashedPassword, phoneNumber || null, firstName, lastName]
    );

    const row = result[0][0];
    if (!row || row.UserId === 0) {
      throw { status: 409, message: row?.Message || 'Email already exists' };
    }

    // Auto-verify email on registration for better UX
    await connection.query(
      'UPDATE Users SET IsEmailVerified = TRUE WHERE UserId = ?',
      [row.UserId]
    );

    // Fetch user for token
    const [users] = await connection.query(
      'SELECT UserId, Email, PhoneNumber, FirstName, LastName, Role FROM Users WHERE UserId = ? LIMIT 1',
      [row.UserId]
    );

    const user = users[0];

    return {
      status: true,
      data: { token: signToken(user), user: formatUser(user) },
      message: 'User registered successfully. Welcome!',
    };
  } finally {
    connection.release();
  }
};

/**
 * Login user — fetches full row directly since SP_LoginUser doesn't return PasswordHash
 */
const loginUser = async (emailOrMobile, password) => {
  const connection = await pool.getConnection();
  try {
    // Try to fetch with LockedUntil, but handle if column doesn't exist yet
    let users, user;
    try {
      [users] = await connection.query(
        `SELECT UserId, Email, PasswordHash, PhoneNumber, FirstName, LastName,
                IsEmailVerified, Status, Role, FailedLoginAttempts, LockedUntil
         FROM Users
         WHERE (Email = ? OR PhoneNumber = ?)
         LIMIT 1`,
        [emailOrMobile, emailOrMobile]
      );
    } catch (colError) {
      // If LockedUntil column doesn't exist, query without it
      if (colError.code === 'ER_BAD_FIELD_ERROR') {
        [users] = await connection.query(
          `SELECT UserId, Email, PasswordHash, PhoneNumber, FirstName, LastName,
                  IsEmailVerified, Status, Role, FailedLoginAttempts
           FROM Users
           WHERE (Email = ? OR PhoneNumber = ?)
           LIMIT 1`,
          [emailOrMobile, emailOrMobile]
        );
      } else {
        throw colError;
      }
    }

    if (!users || users.length === 0) {
      throw { status: 401, message: 'Invalid credentials. Please check your email/phone and password.' };
    }

    user = users[0];

    if (user.Status === 'suspended') {
      throw { status: 403, message: 'Your account has been suspended. Please contact support.' };
    }

    // Check if account is locked (only if LockedUntil column exists)
    if (user.LockedUntil && new Date(user.LockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.LockedUntil) - new Date()) / 60000);
      throw { status: 423, message: `Account is temporarily locked. Please try again in ${minutesLeft} minute(s).` };
    }

    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      const newAttempts = (user.FailedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;

      if (newAttempts >= MAX_ATTEMPTS && user.hasOwnProperty('LockedUntil')) {
        // Lock for 15 minutes (only if column exists)
        try {
          await connection.query(
            'UPDATE Users SET FailedLoginAttempts = ?, LockedUntil = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE UserId = ?',
            [newAttempts, user.UserId]
          );
          throw { status: 423, message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' };
        } catch (updateError) {
          // If LockedUntil column doesn't exist, just update failed attempts
          if (updateError.code === 'ER_BAD_FIELD_ERROR') {
            await connection.query(
              'UPDATE Users SET FailedLoginAttempts = ? WHERE UserId = ?',
              [newAttempts, user.UserId]
            );
            throw { status: 423, message: 'Too many failed attempts. Please reset your password.' };
          } else {
            throw updateError;
          }
        }
      }

      await connection.query(
        'UPDATE Users SET FailedLoginAttempts = ? WHERE UserId = ?',
        [newAttempts, user.UserId]
      );
      throw { status: 401, message: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining before lockout.` };
    }

    // Successful login — reset failed attempts and lockout
    if (!user.IsEmailVerified) {
      await connection.query(
        'UPDATE Users SET IsEmailVerified = TRUE WHERE UserId = ?',
        [user.UserId]
      );
      user.IsEmailVerified = true;
    }

    // Try to reset LockedUntil if it exists
    try {
      await connection.query(
        'UPDATE Users SET LastLoginAt = NOW(), FailedLoginAttempts = 0, LockedUntil = NULL WHERE UserId = ?',
        [user.UserId]
      );
    } catch (updateError) {
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        // LockedUntil doesn't exist, update without it
        await connection.query(
          'UPDATE Users SET LastLoginAt = NOW(), FailedLoginAttempts = 0 WHERE UserId = ?',
          [user.UserId]
        );
      } else {
        throw updateError;
      }
    }

    return {
      status: true,
      data: { token: signToken(user), user: formatUser(user) },
      message: 'Login successful',
    };
  } finally {
    connection.release();
  }
};

/**
 * Send OTP — stores in OTPVerification table directly (SP_SendOTP not in schema)
 */
const sendEmailVerificationOTP = async (email) => {
  const connection = await pool.getConnection();
  try {
    // Check user exists
    const [users] = await connection.query(
      'SELECT UserId FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );
    if (!users || users.length === 0) {
      throw { status: 404, message: 'No account found with this email' };
    }

    // Invalidate existing unused OTPs
    await connection.query(
      'UPDATE OTPVerification SET IsUsed = TRUE WHERE Email = ? AND IsUsed = FALSE',
      [email]
    );

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await connection.query(
      'INSERT INTO OTPVerification (Email, OTPCode, ExpiresAt) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    const emailResult = await emailService.sendOTPEmail(email, otp, 10);
    if (!emailResult.success) {
      throw { status: 500, message: 'Failed to send OTP email' };
    }

    return { status: true, message: 'OTP sent to email successfully' };
  } finally {
    connection.release();
  }
};

/**
 * Verify email OTP
 */
const verifyEmailOTP = async (email, otp) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT OTPId FROM OTPVerification
       WHERE Email = ? AND OTPCode = ? AND IsUsed = FALSE AND ExpiresAt > NOW()
       ORDER BY CreatedAt DESC LIMIT 1`,
      [email, otp]
    );

    if (!rows || rows.length === 0) {
      throw { status: 400, message: 'Invalid or expired OTP' };
    }

    // Mark OTP used and verify email
    await connection.query(
      'UPDATE OTPVerification SET IsUsed = TRUE, UsedAt = NOW() WHERE OTPId = ?',
      [rows[0].OTPId]
    );
    await connection.query(
      'UPDATE Users SET IsEmailVerified = TRUE WHERE Email = ?',
      [email]
    );

    // Fetch user for token
    const [users] = await connection.query(
      'SELECT UserId, Email, PhoneNumber, FirstName, LastName, Role, IsEmailVerified FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );

    const user = users[0];
    return {
      status: true,
      data: { token: signToken(user), user: formatUser(user) },
      message: 'Email verified successfully',
    };
  } finally {
    connection.release();
  }
};

/**
 * Send password reset OTP
 */
const sendPasswordResetOTP = async (email) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT UserId FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );

    // Don't reveal if email exists
    if (!users || users.length === 0) {
      return { status: true, message: 'If email exists, OTP has been sent' };
    }

    // Invalidate existing OTPs
    await connection.query(
      'UPDATE OTPVerification SET IsUsed = TRUE WHERE Email = ? AND IsUsed = FALSE',
      [email]
    );

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await connection.query(
      'INSERT INTO OTPVerification (Email, OTPCode, ExpiresAt) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    await emailService.sendOTPEmail(email, otp, 10, 'Password Reset');

    return { status: true, message: 'If email exists, OTP has been sent' };
  } finally {
    connection.release();
  }
};

/**
 * Verify password reset OTP
 * Marks OTP as verified (IsVerified=TRUE) but NOT used yet.
 * resetPassword() then requires IsVerified=TRUE to proceed.
 */
const verifyPasswordResetOTP = async (email, otp) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT OTPId FROM OTPVerification
       WHERE Email = ? AND OTPCode = ? AND IsUsed = FALSE AND ExpiresAt > NOW()
       ORDER BY CreatedAt DESC LIMIT 1`,
      [email, otp]
    );

    if (!rows || rows.length === 0) {
      throw { status: 400, message: 'Invalid or expired OTP' };
    }

    // Mark verified (gate for resetPassword), but not consumed yet
    // Handle if IsVerified column doesn't exist yet
    try {
      await connection.query(
        'UPDATE OTPVerification SET IsVerified = TRUE WHERE OTPId = ?',
        [rows[0].OTPId]
      );
    } catch (updateError) {
      if (updateError.code === 'ER_BAD_FIELD_ERROR') {
        // IsVerified column doesn't exist, just mark as used
        await connection.query(
          'UPDATE OTPVerification SET IsUsed = TRUE, UsedAt = NOW() WHERE OTPId = ?',
          [rows[0].OTPId]
        );
      } else {
        throw updateError;
      }
    }

    return { status: true, message: 'OTP verified. You can now reset your password.' };
  } finally {
    connection.release();
  }
};

/**
 * Reset password — requires a verified OTP (IsVerified=TRUE) for this email.
 * Consuming the OTP here prevents replay attacks.
 * Falls back to checking IsUsed if IsVerified column doesn't exist yet.
 */
const resetPassword = async (email, newPassword) => {
  const connection = await pool.getConnection();
  try {
    validatePasswordStrength(newPassword);

    // Try to require a previously verified (but not yet consumed) OTP
    let verified;
    try {
      [verified] = await connection.query(
        `SELECT OTPId FROM OTPVerification
         WHERE Email = ? AND IsVerified = TRUE AND IsUsed = FALSE AND ExpiresAt > NOW()
         ORDER BY CreatedAt DESC LIMIT 1`,
        [email]
      );
    } catch (colError) {
      // If IsVerified column doesn't exist, check if OTP was recently used
      if (colError.code === 'ER_BAD_FIELD_ERROR') {
        [verified] = await connection.query(
          `SELECT OTPId FROM OTPVerification
           WHERE Email = ? AND IsUsed = TRUE AND UsedAt > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
           ORDER BY CreatedAt DESC LIMIT 1`,
          [email]
        );
      } else {
        throw colError;
      }
    }

    if (!verified || verified.length === 0) {
      throw { status: 403, message: 'OTP verification required before resetting password' };
    }

    const [users] = await connection.query(
      'SELECT UserId FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );
    if (!users || users.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query(
      'UPDATE Users SET PasswordHash = ?, UpdatedAt = NOW() WHERE UserId = ?',
      [hashedPassword, users[0].UserId]
    );

    // Consume the verified OTP now that the reset is complete
    await connection.query(
      'UPDATE OTPVerification SET IsUsed = TRUE, UsedAt = NOW() WHERE OTPId = ?',
      [verified[0].OTPId]
    );

    return { status: true, message: 'Password reset successfully' };
  } finally {
    connection.release();
  }
};

/**
 * Change password (authenticated user)
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const connection = await pool.getConnection();
  try {
    validatePasswordStrength(newPassword);

    const [users] = await connection.query(
      'SELECT PasswordHash FROM Users WHERE UserId = ? LIMIT 1',
      [userId]
    );
    if (!users || users.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].PasswordHash);
    if (!isOldPasswordValid) {
      throw { status: 401, message: 'Current password is incorrect' };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await connection.query(
      'UPDATE Users SET PasswordHash = ?, UpdatedAt = NOW() WHERE UserId = ?',
      [newPasswordHash, userId]
    );

    return { status: true, message: 'Password changed successfully' };
  } finally {
    connection.release();
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      `SELECT UserId, Email, PhoneNumber, FirstName, LastName, Role, IsEmailVerified, Status, CreatedAt
       FROM Users WHERE UserId = ? LIMIT 1`,
      [userId]
    );

    if (!users || users.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    return { status: true, data: users[0] };
  } finally {
    connection.release();
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, data) => {
  const connection = await pool.getConnection();
  try {
    const { firstName, lastName, phoneNumber } = data;
    if (phoneNumber) validateMobileNumber(phoneNumber);

    await connection.query(
      'UPDATE Users SET FirstName = ?, LastName = ?, PhoneNumber = ?, UpdatedAt = NOW() WHERE UserId = ?',
      [firstName, lastName || '', phoneNumber || null, userId]
    );

    return getUserById(userId);
  } finally {
    connection.release();
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  changePassword,
  getUserById,
  updateUserProfile,
};
