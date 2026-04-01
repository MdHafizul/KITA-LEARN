/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

const { verifyAccessToken } = require('../utils/jwt');
const { AuthException, ForbiddenException } = require('../exceptions');
const { statusCodes } = require('../config/constants');

/**
 * Extract JWT from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Verify JWT token and extract user info
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthException('Missing authorization token');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      error: error.message || 'Invalid or expired token',
      code: 'UNAUTHORIZED'
    });
  }
};

/**
 * Check if user has required role
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(statusCodes.FORBIDDEN).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Check if user is authenticated (optional auth)
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
  extractToken
};
