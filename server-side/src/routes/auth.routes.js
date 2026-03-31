const express = require('express');
const { authController } = require('../controllers');
const { validateBody } = require('../middleware/validation.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { LoginDTO, RegisterDTO } = require('../models/dtos');

const authRoutes = express.Router();

/**
 * POST /api/v1/auth/login
 * User login - returns JWT token and refresh token
 */
authRoutes.post('/login', validateBody(LoginDTO), authController.login);

/**
 * POST /api/v1/auth/register
 * User registration - creates new account
 */
authRoutes.post('/register', validateBody(RegisterDTO), authController.register);

/**
 * POST /api/v1/auth/refresh
 * Refresh JWT tokens
 */
authRoutes.post('/refresh', authController.refreshToken);

/**
 * GET /api/v1/auth/profile
 * Get current user profile
 */
authRoutes.get('/profile', authMiddleware, authController.getProfile);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
authRoutes.put('/profile', authMiddleware, authController.updateProfile);

/**
 * POST /api/v1/auth/logout
 * User logout
 */
authRoutes.post('/logout', authMiddleware, authController.logout);

module.exports = authRoutes;
