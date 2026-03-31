const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(prisma.auditLog);
  }

  /**
   * Log action with full context
   */
  async logAction(data) {
    return this.create({
      userId: data.userId,
      action: data.action,
      description: data.description,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Find logs by user
   */
  async findByUser(userId, options = {}) {
    return this.findMany(
      { userId },
      { ...options, orderBy: { timestamp: 'desc' } }
    );
  }

  /**
   * Find logs by action
   */
  async findByAction(action, options = {}) {
    return this.findMany(
      { action },
      { ...options, orderBy: { timestamp: 'desc' } }
    );
  }

  /**
   * Find logs by entity
   */
  async findByEntity(entityType, entityId, options = {}) {
    return this.findMany(
      { entityType, entityId },
      { ...options, orderBy: { timestamp: 'desc' } }
    );
  }

  /**
   * Get activity summary for date range
   */
  async getActivitySummary(startDate, endDate) {
    const logs = await this.findMany({
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    });

    const actionCounts = {};
    logs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    return {
      totalActions: logs.length,
      actionCounts,
      dateRange: { startDate, endDate },
    };
  }

  /**
   * Get user activity timeline
   */
  async getUserTimeline(userId, limit = 50) {
    return this.findMany(
      { userId },
      {
        limit,
        orderBy: { timestamp: 'desc' },
      }
    );
  }

  /**
   * Track sensitive operations
   */
  async logSensitiveAction(data) {
    return this.logAction({
      ...data,
      action: `SENSITIVE_${data.action}`,
      description: `Sensitive: ${data.description}`,
    });
  }

  /**
   * Get logs by date range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    return this.findMany(
      {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      { ...options, orderBy: { timestamp: 'desc' } }
    );
  }
}

module.exports = AuditLogRepository;
