/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Submissions Routes
 * HTTP routes for submission endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent, requireRole } = require('../../../middleware/auth.middleware');
const submissionsController = require('../controllers/submissions.controller');
const {
    SubmissionCreateDTO,
    SubmissionUpdateDTO,
    SubmissionGradeDTO,
    BatchGradeDTO
} = require('../dtos/submissions.dtos');
const { z } = require('zod');

const submissionsRoutes = express.Router();

const SubmissionIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const ActivityIdDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()])
});

// ============================================
// INDIVIDUAL SUBMISSION OPERATIONS
// ============================================

/**
 * GET /api/v1/submissions/:id
 * Get submission by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/:id',
    authMiddleware,
    validateParams(SubmissionIdDTO),
    submissionsController.getSubmission
);

/**
 * PUT /api/v1/submissions/:id
 * Update submission draft (student/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.put(
    '/:id',
    authMiddleware,
    validateParams(SubmissionIdDTO),
    validateBody(SubmissionUpdateDTO),
    submissionsController.updateSubmission
);

/**
 * POST /api/v1/submissions/:id/submit
 * Submit assignment (student/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.post(
    '/:id/submit',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateParams(SubmissionIdDTO),
    submissionsController.submitAssignment
);

/**
 * POST /api/v1/submissions/:id/grade
 * Grade submission (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.post(
    '/:id/grade',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(SubmissionIdDTO),
    validateBody(SubmissionGradeDTO),
    submissionsController.gradeSubmission
);

/**
 * POST /api/v1/submissions/:id/return
 * Return submission for revision (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.post(
    '/:id/return',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(SubmissionIdDTO),
    submissionsController.returnForRevision
);

/**
 * DELETE /api/v1/submissions/:id
 * Delete submission (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(SubmissionIdDTO),
    submissionsController.deleteSubmission
);

// ============================================
// CURRENT USER SUBMISSION OPERATIONS
// ============================================

/**
 * GET /api/v1/me/submissions
 * Get current user's submissions
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/me/submissions',
    authMiddleware,
    submissionsController.getMySubmissions
);

/**
 * GET /api/v1/me/submissions/stats
 * Get user submission statistics
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/me/submissions/stats',
    authMiddleware,
    submissionsController.getUserStats
);

// ============================================
// ACTIVITY SUBMISSION OPERATIONS
// ============================================

/**
 * POST /api/v1/activities/:activityId/submissions
 * Create/open submission (student/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.post(
    '/activity/:activityId',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateParams(ActivityIdDTO),
    submissionsController.createSubmission
);

/**
 * GET /api/v1/activities/:activityId/submissions
 * Get submissions for activity (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/activity/:activityId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    submissionsController.getSubmissionsByActivity
);

/**
 * POST /api/v1/activities/:activityId/submissions/batch-grade
 * Grade multiple submissions (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.post(
    '/activity/:activityId/batch-grade',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    validateBody(BatchGradeDTO),
    submissionsController.batchGradeSubmissions
);

/**
 * GET /api/v1/activities/:activityId/submissions/stats
 * Get activity submission statistics (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/activity/:activityId/stats',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    submissionsController.getActivityStats
);

/**
 * GET /api/v1/activities/:activityId/submissions/late
 * Get late submissions (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/activity/:activityId/late',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    submissionsController.getLateSubmissions
);

/**
 * GET /api/v1/activities/:activityId/submissions/ungraded
 * Get ungraded submissions (instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/activity/:activityId/ungraded',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    submissionsController.getUngradedSubmissions
);

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * GET /api/v1/submissions
 * Get all submissions with filters (admin only)
 * Query: activityId, userId, status, isLate, page, limit
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
submissionsRoutes.get(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    submissionsController.listSubmissions
);

module.exports = submissionsRoutes;


