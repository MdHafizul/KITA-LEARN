const { PrismaClient } = require('@prisma/client');
const { auditLog: auditRepository } = require('../repositories');

const prisma = new PrismaClient();

class AuditService {
  /**
   * Get all audit logs (Admin only)
   */
  async getAuditLogs({ page = 1, limit = 50, action, userId } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, email: true, fullName: true } } }
    });

    const total = await prisma.auditLog.count({ where });

    return {
      logs,
      page,
      limit,
      total
    };
  }

  /**
   * Get activity logs for a specific user
   */
  async getUserActivityLogs(userId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, email: true, fullName: true } } }
    });

    const total = await prisma.auditLog.count({
      where: { userId }
    });

    return {
      logs,
      page,
      limit,
      total
    };
  }

  /**
   * Get course change history (audit logs for a course)
   */
  async getCourseChangeHistory(courseId, userId, { page = 1, limit = 50 } = {}) {
    try {
      // Verify user has access
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { lecturer: true }
      });

      if (!course) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      // Only lecturer or admin can view course change history
      const currentUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (currentUser.role !== 'ADMIN' && course.lecturerId !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const skip = (page - 1) * limit;

      const logs = await prisma.auditLog.findMany({
        where: {
          entity: 'Course',
          entityId: courseId
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, email: true, fullName: true } } }
      });

      const total = await prisma.auditLog.count({
        where: {
          entity: 'Course',
          entityId: courseId
        }
      });

      return {
        success: true,
        logs,
        page,
        limit,
        total
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs({ action, startDate, endDate } = {}) {
    const where = {};

    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, fullName: true } } }
    });

    if (logs.length === 0) {
      return null;
    }

    // Convert to CSV format
    const headers = ['Timestamp', 'User ID', 'User Email', 'Action', 'Changes', 'Entity', 'Entity ID', 'IP Address'];
    const rows = logs.map(log => [
      log.createdAt.toISOString(),
      log.userId,
      log.user?.email || 'N/A',
      log.action,
      log.changes || 'N/A',
      log.entity || 'N/A',
      log.entityId || 'N/A',
      log.ipAddress || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = new AuditService();
