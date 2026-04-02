/**
 * Request Validation Middleware
 * Validates request data using Zod schemas
 */

const { ZodError } = require('zod');
const { statusCodes } = require('../config/constants');

/**
 * Validate request body with Zod schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: messages
        });
      }

      next(error);
    }
  };
};

/**
 * Validate request body (alias for validateRequest)
 */
const validateBody = (schema) => validateRequest(schema);

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validated = { ...req.validated, query: validated };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Query validation failed',
          code: 'VALIDATION_ERROR',
          details: messages
        });
      }

      next(error);
    }
  };
};

/**
 * Validate URL parameters
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.validated = { ...req.validated, params: validated };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Parameter validation failed',
          code: 'VALIDATION_ERROR',
          details: messages
        });
      }

      next(error);
    }
  };
};

module.exports = {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams
};

