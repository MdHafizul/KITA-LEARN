/**
 * AuthController - Handles authentication endpoints
 * Routes: POST /login, POST /register, POST /refresh, GET /profile
 */

const { statusCodes } = require('../config/constants');
const { AuthService } = require('../services');
const { LoginDTO, RegisterDTO, RefreshTokenDTO, UpdateProfileDTO, ChangePasswordDTO } = require('../models/dtos');

class AuthController {
  /**
   * Login user with email and password
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  async login(req, res, next) {
    try {
      // Validate request
      const validated = LoginDTO.parse(req.body);

      // Call service
      const result = await AuthService.login(validated.email, validated.password);

      // Return token and user data
      res.status(statusCodes.OK).json({
        success: true,
        data: {
          user: result.user,
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_in: result.expires_in
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   * Body: { email, password, full_name, phone_number, role }
   */
  async register(req, res, next) {
    try {
      // Validate request
      const validated = RegisterDTO.parse(req.body);

      // Call service
      const result = await AuthService.register(validated);

      // Return success with user data
      res.status(statusCodes.CREATED).json({
        success: true,
        data: {
          user: result.user,
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_in: result.expires_in
        },
        message: 'Registration successful'
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
  async refreshToken(req, res, next) {
    try {
      // Validate request
      const validated = RefreshTokenDTO.parse(req.body);

      // Call service
      const result = await AuthService.refreshToken(validated.refreshToken);

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          access_token: result.access_token,
          expires_in: result.expires_in
        },
        message: 'Token refreshed successfully'
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
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Call service
      const result = await AuthService.getUserDetails(userId);

      res.status(statusCodes.OK).json({
        success: true,
        data: result.user,
        message: 'Profile retrieved'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   * Body: { full_name, phone_number, email }
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;

      // Validate request
      const validated = UpdateProfileDTO.parse(req.body);

      // Call service
      const result = await AuthService.updateProfile(userId, validated);

      res.status(statusCodes.OK).json({
        success: true,
        data: result.user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/v1/auth/change-password
   * Body: { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;

      // Validate request
      const validated = ChangePasswordDTO.parse(req.body);

      // Call service
      const result = await AuthService.changePassword(userId, validated.currentPassword, validated.newPassword);

      res.status(statusCodes.OK).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (optional - for logging logout events)
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      res.status(statusCodes.OK).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

