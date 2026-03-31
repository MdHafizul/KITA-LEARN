const jwt = require('jsonwebtoken');
const { UnauthorizedException, ForbiddenException } = require('../exceptions');

/**
 * Verify JWT Token Middleware
 * Extracts and validates JWT from Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return res.status(401).json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      status: 401
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Checks if user has required role
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        status: 403
      });
    }

    next();
  };
};

/**
 * Permission-Based Access Control Middleware
 * Checks if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user has permission (would check database in real app)
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        code: 'FORBIDDEN',
        status: 403
      });
    }

    next();
  };
};

/**
 * Optional Auth Middleware
 * Attempts to authenticate but doesn't fail if missing
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  
  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  optionalAuth
};
