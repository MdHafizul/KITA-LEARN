const express = require('express');
const { auditController } = require('../controllers');
const { validateQuery, validateParams } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { PaginationDTO } = require('../models/dtos');
const { z } = require('zod');

const auditRoutes = express.Router();

const UserIdDTO = z.object({ userId: z.string().uuid() });

/**
 * GET /api/v1/audit/logs
 * Get all audit logs (Admin only)
 */
auditRoutes.get(
  '/logs',
  authMiddleware,
  requireRole(['ADMIN']),
  validateQuery(PaginationDTO),
  auditController.getAuditLogs
);

/**
 * GET /api/v1/audit/users/:userId/activity
 * Get user activity logs
 */
auditRoutes.get(
  '/users/:userId/activity',
  authMiddleware,
  requireRole(['ADMIN']),
  validateParams(UserIdDTO),
  auditController.getUserActivity
);

/**
 * GET /api/v1/audit/courses/:courseId/changes
 * Get course change history
 */
auditRoutes.get(
  '/courses/:courseId/changes',
  authMiddleware,
  requireRole(['ADMIN']),
  auditController.getCourseChangeHistory
);

/**
 * GET /api/v1/audit/export
 * Export audit logs (CSV/JSON)
 */
auditRoutes.get(
  '/export',
  authMiddleware,
  requireRole(['ADMIN']),
  auditController.exportAuditLogs
);

module.exports = auditRoutes;
