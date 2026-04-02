/**
 * Error Handling Middleware
 * Centralized error handling for all exceptions
 */

const { BaseException } = require('../exceptions');
const { statusCodes } = require('../config/constants');
const { logger } = require('../utils');

/**
 * Global error handler middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Handle custom exceptions
  if (err instanceof BaseException) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }

  // Handle validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));

    return res.status(statusCodes.BAD_REQUEST).json({
      success: false,
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: messages
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(statusCodes.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(statusCodes.CONFLICT).json({
      success: false,
      error: 'Unique constraint violation',
      code: 'CONFLICT'
    });
  }

  if (err.code === 'P2025') {
    return res.status(statusCodes.NOT_FOUND).json({
      success: false,
      error: 'Record not found',
      code: 'NOT_FOUND'
    });
  }

  // Handle general errors
  res.status(statusCodes.INTERNAL_ERROR).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    code: 'INTERNAL_ERROR'
  });
};

/**
 * 404 Not Found middleware
 */
const notFoundMiddleware = (req, res) => {
  res.status(statusCodes.NOT_FOUND).json({
    success: false,
    error: `Route not found: ${req.method} ${req.url}`,
    code: 'NOT_FOUND'
  });
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware
};
