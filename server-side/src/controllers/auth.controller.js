/**
 * AuthController - Handles authentication endpoints
 * Routes: POST /login, POST /register, POST /refresh, GET /profile
 */

const { statusCodes, errorMessages } = require('../config/constants');
const { AuthService } = require('../services');
const { LoginDTO, RegisterDTO } = require('../models/dtos');

class AuthController {
  /**
   * Login user with email and password
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  static async login(req, res, next) {
    try {
      // Validate request
      const validated = LoginDTO.parse(req.body);

      // Call service
      const result = await AuthService.login(validated.email, validated.password);

      if (!result.success) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          error: result.error,
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Return token and user data
      res.status(statusCodes.OK).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
          expiresIn: 3600, // 1 hour
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   * Body: { email, password, fullName, role }
   */
  static async register(req, res, next) {
    try {
      // Validate request
      const validated = RegisterDTO.parse(req.body);

      // Call service
      const result = await AuthService.register(validated);

      if (!result.success) {
        return res.status(statusCodes.CONFLICT).json({
          success: false,
          error: result.error,
          code: 'USER_EXISTS',
        });
      }

      // Return success with user data
      res.status(statusCodes.CREATED).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          message: 'Registration successful',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token using refresh token
   * POST /api/v1/auth/refresh
   * Body: { refreshToken }
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN',
        });
      }

      // Call service
      const result = await AuthService.refreshToken(refreshToken);

      if (!result.success) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          error: result.error,
          code: 'INVALID_REFRESH_TOKEN',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          token: result.token,
          expiresIn: 3600,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   * Headers: Authorization: Bearer {token}
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Call service
      const user = await AuthService.getProfile(userId);

      if (!user) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   * Body: { fullName, phone, bio }
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, phone, bio } = req.body;

      // Call service
      const result = await AuthService.updateProfile(userId, {
        fullName,
        phone,
        bio,
      });

      if (!result.success) {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: result.error,
          code: 'UPDATE_FAILED',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { user: result.user },
        message: 'Profile updated',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (invalidate token)
   * POST /api/v1/auth/logout
   */
  static async logout(req, res, next) {
    try {
      const userId = req.user.id;

      // Call service to log the logout event
      await AuthService.logout(userId);

      res.status(statusCodes.OK).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   * Body: { email }
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Email is required',
          code: 'MISSING_EMAIL',
        });
      }

      // Call service
      const result = await AuthService.forgotPassword(email);

      // Always return success (don't reveal if user exists)
      res.status(statusCodes.OK).json({
        success: true,
        message: 'If user exists, password reset email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   * Body: { token, newPassword }
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Token and new password required',
          code: 'MISSING_FIELDS',
        });
      }

      // Call service
      const result = await AuthService.resetPassword(token, newPassword);

      if (!result.success) {
        return res.status(statusCodes.UNAUTHORIZED).json({
          success: false,
          error: result.error,
          code: 'INVALID_RESET_TOKEN',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
