/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * SLT Tracking Routes
 * Express endpoints for student learning trajectory tracking
 * Middleware: authMiddleware (require token), requireRole for admin endpoints
 */

const express = require('express');
const router = express.Router();
const sltTrackingController = require('../controllers/slt-tracking.controller');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent } = require('../../../middleware/auth.middleware');

// ============================================
// ACTIVITY TRACKING ROUTES (Authenticated)
// ============================================

/**
 * POST /api/v1/tracking/activities/start
 * Start tracking an activity
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/activities/start', authMiddleware, sltTrackingController.startActivityTracking);

/**
 * POST /api/v1/tracking/activities/:activityId/complete
 * Mark activity as completed
 */
router.post(
  '/activities/:activityId/complete',
  authMiddleware,
  sltTrackingController.completeActivity
);

/**
 * PUT /api/v1/tracking/activities/:activityId/progress
 * Update activity progress
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.put(
  '/activities/:activityId/progress',
  authMiddleware,
  sltTrackingController.updateActivityProgress
);

/**
 * GET /api/v1/tracking/activities
 * Get user's activity trackings with filters
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/activities', authMiddleware, sltTrackingController.getUserActivityTrackings);

/**
 * GET /api/v1/tracking/activities/completed
 * Get completed activities for user
 */
router.get('/activities/completed', authMiddleware, sltTrackingController.getCompletedActivities);

/**
 * GET /api/v1/tracking/activities/pending
 * Get pending activities for user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/activities/pending', authMiddleware, sltTrackingController.getPendingActivities);

/**
 * GET /api/v1/tracking/activities/in-progress
 * Get in-progress activities for user
 */
router.get(
  '/activities/in-progress',
  authMiddleware,
  sltTrackingController.getInProgressActivities
);

/**
 * GET /api/v1/tracking/activities/stats
 * Get activity tracking statistics
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/activities/stats', authMiddleware, sltTrackingController.getActivityStats);

/**
 * POST /api/v1/tracking/activities/bulk
 * Bulk create activity trackings
 */
router.post('/activities/bulk', authMiddleware, sltTrackingController.bulkTrackActivities);

// ============================================
// SLT SUMMARY ROUTES (Authenticated)
// ============================================

/**
 * GET /api/v1/tracking/summary/me
 * Get current user's SLT summary
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/summary/me', authMiddleware, sltTrackingController.getMyLearningTrajectory);

/**
 * GET /api/v1/tracking/metrics/me
 * Get current user's learning metrics
 */
router.get('/metrics/me', authMiddleware, sltTrackingController.getMyMetrics);

/**
 * PUT /api/v1/tracking/summary/me
 * Update current user's SLT summary
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.put('/summary/me', authMiddleware, sltTrackingController.updateMySummary);

// ============================================
// ADMIN SUMMARY ROUTES
// ============================================

/**
 * POST /api/v1/tracking/summary/:userId/course-enrollment
 * Record course enrollment (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/summary/:userId/course-enrollment',
  authMiddleware,
  sltTrackingController.recordCourseEnrollment
);

/**
 * POST /api/v1/tracking/summary/:userId/course-completion
 * Record course completion (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/summary/:userId/course-completion',
  authMiddleware,
  sltTrackingController.recordCourseCompletion
);

/**
 * POST /api/v1/tracking/summary/:userId/certificate
 * Record certificate earned (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/summary/:userId/certificate',
  authMiddleware,
  sltTrackingController.recordCertificateEarned
);

/**
 * PUT /api/v1/tracking/summary/:userId/score
 * Update user's average score (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.put(
  '/summary/:userId/score',
  authMiddleware,
  sltTrackingController.updateUserScore
);

/**
 * GET /api/v1/tracking/summaries
 * Filter SLT summaries (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/summaries', authMiddleware, sltTrackingController.filterSummaries);

// ============================================
// LEADERBOARD ROUTES (Public)
// ============================================

/**
 * GET /api/v1/tracking/leaderboard/completion
 * Get leaderboard by course completion
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/leaderboard/completion',
  authMiddleware,
  sltTrackingController.getCompletionLeaderboard
);

/**
 * GET /api/v1/tracking/leaderboard/certificates
 * Get leaderboard by certificates earned
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/leaderboard/certificates',
  authMiddleware,
  sltTrackingController.getCertificateLeaderboard
);

/**
 * GET /api/v1/tracking/leaderboard/hours
 * Get leaderboard by hours learned
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/leaderboard/hours', authMiddleware, sltTrackingController.getHoursLeaderboard);

/**
 * GET /api/v1/tracking/leaderboard/score
 * Get leaderboard by average score
 */
router.get('/leaderboard/score', authMiddleware, sltTrackingController.getScoreLeaderboard);

module.exports = router;


