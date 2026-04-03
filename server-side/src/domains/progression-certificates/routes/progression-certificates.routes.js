/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Progression & Certificates Routes
 * Express routes for Progression & Certificates domain
 */

const express = require('express');
const { authMiddleware, adminBypass, requireRole, authorizeLecturer } = require('../../../middleware/auth.middleware');
const progressionCertificatesController = require('../controllers/progression-certificates.controller');

const router = express.Router();

// ============================================
// PROGRESSION ROUTES
// ============================================

/**
 * GET /api/v1/progression/me
 * Get current user's progression
 * Auth: Required
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/me', authMiddleware, progressionCertificatesController.getMyProgression);

/**
 * GET /api/v1/progression/me/summary
 * Get current user's progression summary
 * Auth: Required
 */
router.get('/me/summary', authMiddleware, progressionCertificatesController.getMyProgressionSummary);

/**
 * GET /api/v1/progression/leaderboard
 * Get progression leaderboard
 * Auth: Required (Public read)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/leaderboard',
  authMiddleware,
  progressionCertificatesController.getProgressionLeaderboard
);

/**
 * GET /api/v1/progression/students/level/:level
 * Get students by level
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/students/level/:level',
  authMiddleware,
  adminBypass,
  authorizeLecturer,
  progressionCertificatesController.getStudentsByLevel
);

/**
 * GET /api/v1/progression/filter
 * Filter progressions (Admin only)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/filter',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.filterProgressions
);

/**
 * POST /api/v1/progression/:userId/award-points
 * Award points to user (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/:userId/award-points',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.awardPoints
);

/**
 * POST /api/v1/progression/:userId/level-up
 * Level up user (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/:userId/level-up',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.levelUpUser
);

// ============================================
// CERTIFICATE ROUTES (except /me)
// ============================================

/**
 * GET /api/v1/certificates/me
 * Get current user's certificates
 * Auth: Required
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/me', authMiddleware, progressionCertificatesController.getMyCertificates);

/**
 * GET /api/v1/certificates/me/active
 * Get current user's active certificates
 * Auth: Required
 */
router.get('/me/active', authMiddleware, progressionCertificatesController.getMyActiveCertificates);

/**
 * GET /api/v1/certificates/course/:courseId
 * Get certificates by course
 * Auth: Required
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/course/:courseId',
  authMiddleware,
  progressionCertificatesController.getCertificatesByCourse
);

/**
 * POST /api/v1/certificates/verify
 * Verify certificate
 * Auth: Public
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/verify', progressionCertificatesController.verifyCertificate);

/**
 * POST /api/v1/certificates/bulk
 * Bulk issue certificates (Admin)
 * Auth: Required (Admin)
 */
router.post(
  '/bulk',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.bulkIssueCertificates
);

/**
 * GET /api/v1/certificates
 * Filter certificates (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.filterCertificates
);

/**
 * POST /api/v1/certificates
 * Issue certificate (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post(
  '/',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.issueCertificate
);

/**
 * GET /api/v1/certificates/:certificateId
 * Get certificate by ID
 * Auth: Required
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/:certificateId', authMiddleware, progressionCertificatesController.getCertificateById);

/**
 * PUT /api/v1/certificates/:certificateId
 * Update certificate (Admin)
 * Auth: Required (Admin)
 */
router.put(
  '/:certificateId',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.updateCertificate
);

/**
 * DELETE /api/v1/certificates/:certificateId
 * Delete certificate (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.delete(
  '/:certificateId',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.deleteCertificate
);

// ============================================
// ACHIEVEMENTS ROUTES
// ============================================

/**
 * GET /api/v1/progress/me/achievements
 * Get current user's achievement summary
 * Auth: Required
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/me/achievements',
  authMiddleware,
  progressionCertificatesController.getMyAchievements
);

/**
 * GET /api/v1/progress/:userId/achievements
 * Get user's achievement summary (Admin)
 * Auth: Required (Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get(
  '/:userId/achievements',
  authMiddleware,
  requireRole(['ADMIN']),
  progressionCertificatesController.getUserAchievements
);

module.exports = router;


