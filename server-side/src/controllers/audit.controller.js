/**
 * AuditController - Handles audit log retrieval and reporting
 */

const { statusCodes } = require('../config/constants');
const { AuditService } = require('../services');

class AuditController {
  /**
   * Get audit logs (Admin only)
   * GET /api/v1/audit?page=1&limit=50&action=...&userId=...
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, action, userId } = req.query;

      // Only admin can view audit logs
      if (req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Access denied',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      const result = await AuditService.getAuditLogs(
        { page: parseInt(page), limit: parseInt(limit), action, userId }
      );

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user activity logs
   * GET /api/v1/audit/user/:userId
   */
  static async getUserActivityLogs(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const currentUserId = req.user.id;

      // Users can only view their own logs, admins can view anyone's
      if (userId !== currentUserId && req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Access denied',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      const result = await AuditService.getUserActivityLogs(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get course activity logs
   * GET /api/v1/audit/course/:courseId
   */
  static async getCourseActivityLogs(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.id;

      const result = await AuditService.getCourseActivityLogs(courseId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      if (!result.success) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: result.error,
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export audit logs to CSV (Admin only)
   * GET /api/v1/audit/export?action=...&startDate=...&endDate=...
   */
  static async exportAuditLogs(req, res, next) {
    try {
      // Admin only
      if (req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Access denied',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      const { action, startDate, endDate } = req.query;

      const csvData = await AuditService.exportAuditLogsToCSV({
        action,
        startDate,
        endDate,
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs.csv"`);
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditController;
