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

    // Attach user to request (normalize role to uppercase for consistent comparison)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role?.toUpperCase() || 'USER'
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

    // Normalize both sides for case-insensitive comparison
    const userRole = req.user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
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
        role: decoded.role?.toUpperCase() || 'USER'
      };
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

/**
 * Check if user is ADMIN (for admin-only operations)
 * Must be used AFTER authMiddleware
 */
const isAdmin = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(statusCodes.UNAUTHORIZED).json({
        success: false,
        error: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    const userRole = req.user.role?.toUpperCase();

    if (userRole !== 'ADMIN') {
      return res.status(statusCodes.FORBIDDEN).json({
        success: false,
        error: 'Admin access required',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Admin Bypass - Sets isAdmin flag on request object without blocking
 * Used in Global Admin Bypass RBAC pattern to allow admins to bypass role checks
 * Must be used AFTER authMiddleware
 */
const adminBypass = (req, res, next) => {
  if (!req.user) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Not authenticated',
      code: 'UNAUTHORIZED'
    });
  }

  // Set isAdmin flag on request for service layer to use
  req.isAdmin = req.user.role?.toUpperCase() === 'ADMIN';

  next();
};

/**
 * Authorize Lecturer - Verifies user is LECTURER or ADMIN (via adminBypass)
 * Used in Global Admin Bypass RBAC pattern
 * Must be used AFTER adminBypass middleware
 */
const authorizeLecturer = (req, res, next) => {
  if (!req.user) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Not authenticated',
      code: 'UNAUTHORIZED'
    });
  }

  const userRole = req.user.role?.toUpperCase();

  // Allow if user is admin (bypass already set) OR is lecturer
  if (userRole === 'ADMIN' || userRole === 'LECTURER') {
    return next();
  }

  return res.status(statusCodes.FORBIDDEN).json({
    success: false,
    error: 'Lecturer or Admin access required',
    code: 'FORBIDDEN'
  });
};

/**
 * Authorize Student - Verifies user is STUDENT or ADMIN (via adminBypass)
 * Used in Global Admin Bypass RBAC pattern
 * Must be used AFTER adminBypass middleware
 */
const authorizeStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Not authenticated',
      code: 'UNAUTHORIZED'
    });
  }

  const userRole = req.user.role?.toUpperCase();

  // Allow if user is admin (bypass already set) OR is student
  if (userRole === 'ADMIN' || userRole === 'STUDENT') {
    return next();
  }

  return res.status(statusCodes.FORBIDDEN).json({
    success: false,
    error: 'Student or Admin access required',
    code: 'FORBIDDEN'
  });
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
  isAdmin,
  adminBypass,
  authorizeLecturer,
  authorizeStudent,
  extractToken
};
