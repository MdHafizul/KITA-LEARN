/**
 * Winston Logger Configuration
 * Production-grade logging with rotating files, error tracking, and metrics
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const LOG_DIR = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Custom format for logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(info => {
    const baseLog = `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`;

    // Add context if available
    if (info.context) {
      return `${baseLog} | ${info.context}`;
    }

    // Add stack trace if error
    if (info.stack) {
      return `${baseLog}\n${info.stack}`;
    }

    // Add extra data if available
    if (Object.keys(info).length > 3) {
      const extra = JSON.stringify(
        Object.keys(info)
          .filter(key => !['timestamp', 'level', 'message', 'context', 'stack'].includes(key))
          .reduce((obj, key) => {
            obj[key] = info[key];
            return obj;
          }, {})
      );
      return `${baseLog} | ${extra}`;
    }

    return baseLog;
  })
);

// Console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(info => {
    const baseLog = `${info.timestamp} [${info.level}] ${info.message}`;
    if (info.context) {
      return `${baseLog} | ${info.context}`;
    }
    return baseLog;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: customFormat,
  defaultMeta: { service: 'lms-api' },
  transports: [
    // Console transport (always active)
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),

    // Combined log file (all levels)
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: customFormat
    }),

    // Error log file (errors and warnings only)
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '90d',
      format: customFormat
    }),

    // Debug log file (development only)
    ...(!process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? [
        new DailyRotateFile({
          filename: path.join(LOG_DIR, 'debug-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'debug',
          maxSize: '20m',
          maxFiles: '7d',
          format: customFormat
        })
      ]
      : [])
  ]
});

/**
 * Log HTTP requests
 */
const logHttpRequest = (req, res, duration) => {
  logger.info(`HTTP ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    status: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
    context: `${req.method} ${req.path}`
  });
};

/**
 * Log database operations
 */
const logDatabaseOperation = (operation, table, duration, data = {}) => {
  const level = operation === 'SELECT' ? 'debug' : 'info';
  logger.log(level, `Database ${operation}`, {
    operation,
    table,
    duration: `${duration}ms`,
    ...data,
    context: `DB ${operation} ${table}`
  });
};

/**
 * Log authentication events
 */
const logAuthEvent = (event, userId, data = {}) => {
  logger.info(`Auth ${event}`, {
    event,
    userId,
    ...data,
    context: `AUTH ${event} ${userId}`
  });
};

/**
 * Log API errors with context
 */
const logApiError = (error, context = {}) => {
  logger.error(`API Error: ${error.message}`, {
    errorCode: error.code,
    errorStatus: error.statusCode,
    stack: error.stack,
    ...context,
    context: `ERROR ${error.code || 'UNKNOWN'}`
  });
};

/**
 * Log business events (audit trail)
 */
const logAuditEvent = (event, userId, action, details = {}) => {
  logger.info(`Audit ${event}`, {
    event,
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
    context: `AUDIT ${action} ${userId}`
  });
};

/**
 * Log job queue events
 */
const logJobEvent = (jobName, status, duration = 0, data = {}) => {
  const level = status === 'failed' ? 'error' : 'info';
  logger.log(level, `Job ${jobName} ${status}`, {
    jobName,
    status,
    duration: `${duration}ms`,
    ...data,
    context: `JOB ${jobName} ${status}`
  });
};

/**
 * Log performance metrics
 */
const logMetrics = (metric, value, unit = '', threshold = null) => {
  const level = threshold && value > threshold ? 'warn' : 'debug';
  const message = threshold && value > threshold
    ? `Performance Alert: ${metric} exceeded threshold`
    : `Metric ${metric}`;

  logger.log(level, message, {
    metric,
    value,
    unit,
    threshold,
    context: `METRIC ${metric}`
  });
};

module.exports = {
  logger,
  logHttpRequest,
  logDatabaseOperation,
  logAuthEvent,
  logApiError,
  logAuditEvent,
  logJobEvent,
  logMetrics,
  // Legacy methods for compatibility
  error: (msg, data) => logger.error(msg, data),
  warn: (msg, data) => logger.warn(msg, data),
  info: (msg, data) => logger.info(msg, data),
  debug: (msg, data) => logger.debug(msg, data)
};
