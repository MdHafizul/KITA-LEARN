const { ZodError } = require('zod');
const { ValidationException } = require('../exceptions');

/**
 * Zod Validation Middleware Factory
 * Validates req.body, req.params, or req.query against a schema
 */
const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
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
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
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
