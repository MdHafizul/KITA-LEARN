/**
 * Utils Barrel Export
 * Complete utility module exports
 */

const {
  logger,
  logHttpRequest,
  logDatabaseOperation,
  logAuthEvent,
  logApiError,
  logAuditEvent,
  logJobEvent,
  logMetrics,
  error,
  warn,
  info,
  debug
} = require('./logger');

const { hashPassword, comparePassword } = require('./hash');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('./jwt');
const metricsCollector = require('./metrics');
const {
  checkDatabaseHealth,
  checkRedisHealth,
  checkQueuesHealth,
  getSystemHealth,
  getAppInfo,
  getDatabaseStats,
  getDiagnostics
} = require('./monitoring');

module.exports = {
  // Logger
  logger,
  logHttpRequest,
  logDatabaseOperation,
  logAuthEvent,
  logApiError,
  logAuditEvent,
  logJobEvent,
  logMetrics,
  error,
  warn,
  info,
  debug,

  // Hash
  hashPassword,
  comparePassword,

  // JWT
  generateAccessToken,
  generateRefreshToken,
  verifyToken,

  // Metrics
  metricsCollector,

  // Monitoring
  checkDatabaseHealth,
  checkRedisHealth,
  checkQueuesHealth,
  getSystemHealth,
  getAppInfo,
  getDatabaseStats,
  getDiagnostics
};
