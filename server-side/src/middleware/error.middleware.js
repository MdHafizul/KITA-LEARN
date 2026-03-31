const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent response format
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Request error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    statusCode: error.statusCode || 500
  });

  // Handle known error types
  if (error.name === 'UnauthorizedException') {
    return res.status(401).json({
      success: false,
      error: error.message,
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  if (error.name === 'ForbiddenException') {
    return res.status(403).json({
      success: false,
      error: error.message,
      code: 'FORBIDDEN',
      status: 403
    });
  }

  if (error.name === 'ConflictException') {
    return res.status(409).json({
      success: false,
      error: error.message,
      code: 'CONFLICT',
      status: 409
    });
  }

  if (error.name === 'ValidationException') {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      details: error.details,
      status: 400
    });
  }

  if (error.name === 'NotFoundException') {
    return res.status(404).json({
      success: false,
      error: error.message,
      code: 'NOT_FOUND',
      status: 404
    });
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Unique constraint violation',
      code: 'CONFLICT',
      status: 409
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found',
      code: 'NOT_FOUND',
      status: 404
    });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    code: error.code || 'SERVER_ERROR',
    status: error.statusCode || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
    status: 404
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
