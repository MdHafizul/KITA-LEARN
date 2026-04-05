const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  notFoundHandler
} = require('./middleware');
const {
  authRoutes,
  courseRoutes,
  activityRoutes,
  examRoutes,
  submissionRoutes,
  gradingRoutes,
  certificateRoutes,
  enrollmentRoutes,
  auditRoutes,
  announcementRoutes,
  classRoutes
} = require('./routes');
const logger = require('./utils/logger');
const { db } = require('./config/database');
const jobs = require('./jobs');

const app = express();

// ============================================
// INITIALIZE JOB PROCESSORS
// ============================================

jobs.registerJobProcessors();
logger.info('✅ Background job processors registered');

// CORS Configuration
app.use(corsMiddleware);

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Morgan HTTP Logger (skip OPTIONS)
app.use(morgan('combined', {
  skip: (req) => req.method === 'OPTIONS'
}));

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

const {
  getSystemHealth,
  getAppInfo,
  getDiagnostics,
  metricsCollector
} = require('./utils');

/**
 * GET /health
 * Basic health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

/**
 * GET /health/app
 * Application info and version
 */
app.get('/health/app', (req, res) => {
  const appInfo = getAppInfo();
  res.json({
    success: true,
    ...appInfo
  });
});

/**
 * GET /api/v1/health
 * Comprehensive system health check with all services
 */
app.get('/api/v1/health', async (req, res) => {
  try {
    const health = await getSystemHealth(jobs.getQueues());
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      ...health
    });
  } catch (error) {
    logger.error('Comprehensive health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/health/db
 * Database connectivity check
 */
app.get('/api/v1/health/db', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'healthy',
      service: 'postgresql',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'postgresql',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/health/redis
 * Redis cache connectivity check
 */
app.get('/api/v1/health/redis', async (req, res) => {
  try {
    const { redis } = require('./config');
    await redis.ping();
    res.json({
      success: true,
      status: 'healthy',
      service: 'redis',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'redis',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/health/queues
 * Job queue status check
 */
app.get('/api/v1/health/queues', async (req, res) => {
  try {
    const queues = jobs.getQueues();
    const queueStatus = {};

    for (const [name, queue] of Object.entries(queues)) {
      if (queue) {
        const counts = await queue.getJobCounts();
        queueStatus[name] = counts;
      }
    }

    res.json({
      success: true,
      status: 'healthy',
      service: 'job-queues',
      queues: queueStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Queue health check failed', { error: error.message });
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'job-queues',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/metrics
 * Application metrics and performance data
 */
app.get('/api/v1/metrics', (req, res) => {
  const report = metricsCollector.getReport();
  const alerts = metricsCollector.getAlerts();

  res.json({
    success: true,
    metrics: report,
    alerts,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/v1/diagnostics
 * Full system diagnostics (admin only)
 */
app.get('/api/v1/diagnostics', async (req, res) => {
  try {
    // Optional: Add admin check here
    const diagnostics = await getDiagnostics(jobs.getQueues(), metricsCollector);
    res.json({
      success: true,
      ...diagnostics
    });
  } catch (error) {
    logger.error('Diagnostics retrieval failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// API v1 ROUTES
// ============================================

const apiV1 = express.Router();

// Authentication Routes (public + protected)
apiV1.use('/auth', authRoutes);

// Course Management Routes
apiV1.use('/courses', courseRoutes);

// Learning Activity Routes
apiV1.use('/activities', activityRoutes);

// Exam Management Routes
apiV1.use('/exams', examRoutes);

// Assignment Submission Routes
apiV1.use('/submissions', submissionRoutes);

// Grading Routes
apiV1.use('/grades', gradingRoutes);

// Certificate Routes
apiV1.use('/certificates', certificateRoutes);

// Enrollment Routes
apiV1.use('/enrollments', enrollmentRoutes);

// Audit & Logging Routes (Admin only)
apiV1.use('/audit', auditRoutes);

//announcement routes
apiV1.use('/announcements', announcementRoutes);

// Class Management Routes
apiV1.use('/classes', classRoutes);

// Mount all v1 routes under /api/v1
app.use('/api/v1', apiV1);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// ============================================
// EXPORT APP & DEBUG INFO
// ============================================

// Export jobs for graceful shutdown
app.jobs = jobs;

// Log all registered routes (development)
if (process.env.NODE_ENV === 'development') {
  const printRoutes = (stack, prefix = '') => {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase());
        console.log(`  ${methods.join(',')} ${prefix}${middleware.route.path}`);
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        printRoutes(middleware.handle.stack, `${prefix}${middleware.regexp.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\$/g, '')}`);
      }
    });
  };

  console.log('\n✅ Registered Routes:');
  printRoutes(app._router.stack);
  console.log('\n');
}

module.exports = app;
