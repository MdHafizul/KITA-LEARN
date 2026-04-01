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

module.exports = {
  validateRequest
};
          error: 'Query validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          })),
          status: 400
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'SERVER_ERROR',
        status: 500
      });
    }
  };
};

/**
 * Validate URL parameters
 */
const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.validated = { ...req.validated, ...validated };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          })),
          status: 400
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal validation error',
        code: 'SERVER_ERROR',
        status: 500
      });
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
