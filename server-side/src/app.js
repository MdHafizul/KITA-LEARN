const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
  authMiddleware,
  cors: corsMiddleware,
  errorHandler,
  notFoundHandler
} = require('./middleware');
const {
  authRoutes,
  courseRoutes,
  examRoutes,
  submissionRoutes,
  gradingRoutes,
  certificateRoutes,
  enrollmentRoutes,
  auditRoutes
} = require('./routes');
const logger = require('./utils/logger');
const { db } = require('./config/database');

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

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

/**
 * GET /health
 * Basic health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
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
      status: 'Database connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed', error);
    res.status(503).json({
      success: false,
      status: 'Database connection failed',
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

// Exam Management Routes
apiV1.use('/exams', examRoutes);

// Assignment Submission Routes
apiV1.use('/submissions', submissionRoutes);

// Grading Routes
apiV1.use('/grading', gradingRoutes);

// Certificate Routes
apiV1.use('/certificates', certificateRoutes);

// Enrollment Routes
apiV1.use('/enrollments', enrollmentRoutes);

// Audit & Logging Routes (Admin only)
apiV1.use('/audit', auditRoutes);

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
