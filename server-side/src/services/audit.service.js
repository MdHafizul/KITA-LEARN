const { PrismaClient } = require('@prisma/client');
const { auditRepository } = require('../repositories');

const prisma = new PrismaClient();

class AuditService {
  /**
   * Log an audit event
   */
  async log(userId, action, description, model_type, model_id, ipAddress = '0.0.0.0', userAgent = 'api') {
    const auditLog = await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        description,
        model_type,
        model_id,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date()
      }
    });

    return auditLog;
  }

  /**
   * Get audit logs for user
   */
  async getUserAuditLog(userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.auditLog.count({
      where: { user_id: userId }
    });

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit logs for model
   */
  async getModelAuditLog(modelType, modelId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      where: {
        model_type: modelType,
        model_id: modelId
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.auditLog.count({
      where: {
        model_type: modelType,
        model_id: modelId
      }
    });

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get all audit logs
   */
  async getAllAuditLogs(page = 1, limit = 50, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.action) where.action = filters.action;
    if (filters.model_type) where.model_type = filters.model_type;
    if (filters.start_date || filters.end_date) {
      where.timestamp = {};
      if (filters.start_date) where.timestamp.gte = new Date(filters.start_date);
      if (filters.end_date) where.timestamp.lte = new Date(filters.end_date);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
      include: { user: true }
    });

    const total = await prisma.auditLog.count({ where });

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Export audit log to CSV
   */
  async exportAuditLog(filters = {}) {
    const where = {};

    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.action) where.action = filters.action;
    if (filters.model_type) where.model_type = filters.model_type;
    if (filters.start_date || filters.end_date) {
      where.timestamp = {};
      if (filters.start_date) where.timestamp.gte = new Date(filters.start_date);
      if (filters.end_date) where.timestamp.lte = new Date(filters.end_date);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });

    return logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      user_id: log.user_id,
      user_email: log.user?.email,
      action: log.action,
      description: log.description,
      model_type: log.model_type,
      model_id: log.model_id,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    }));
  }

  /**
   * Track sensitive action
   */
  async trackSensitiveAction(userId, action, target, details) {
    return this.log(
      userId,
      action,
      `${action}: ${target} - ${JSON.stringify(details)}`,
      'action',
      userId
    );
  }

  /**
   * Get recent activity (last N logs)
   */
  async getRecentActivity(limit = 20) {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { user: true }
    });

    return logs;
  }

  /**
   * Get activity summary by action
   */
  async getActivitySummary(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const summary = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    return summary;
  }
}

module.exports = new AuditService();
