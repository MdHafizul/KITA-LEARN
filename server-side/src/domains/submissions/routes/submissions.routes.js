/**
 * Submissions Routes
 * HTTP routes for submission endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
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
submissionsRoutes.post(
    '/:id/submit',
    authMiddleware,
    requireRole(['STUDENT', 'ADMIN']),
    validateParams(SubmissionIdDTO),
    submissionsController.submitAssignment
);

/**
 * POST /api/v1/submissions/:id/grade
 * Grade submission (instructor/admin)
 */
submissionsRoutes.post(
    '/:id/grade',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(SubmissionIdDTO),
    validateBody(SubmissionGradeDTO),
    submissionsController.gradeSubmission
);

/**
 * POST /api/v1/submissions/:id/return
 * Return submission for revision (instructor/admin)
 */
submissionsRoutes.post(
    '/:id/return',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(SubmissionIdDTO),
    submissionsController.returnForRevision
);

/**
 * DELETE /api/v1/submissions/:id
 * Delete submission (student/instructor/admin)
 */
submissionsRoutes.delete(
    '/:id',
    authMiddleware,
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
submissionsRoutes.get(
    '/me/submissions',
    authMiddleware,
    submissionsController.getMySubmissions
);

/**
 * GET /api/v1/me/submissions/stats
 * Get user submission statistics
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
submissionsRoutes.post(
    '/activity/:activityId',
    authMiddleware,
    requireRole(['STUDENT', 'ADMIN']),
    validateParams(ActivityIdDTO),
    submissionsController.createSubmission
);

/**
 * GET /api/v1/activities/:activityId/submissions
 * Get submissions for activity (instructor/admin)
 */
submissionsRoutes.get(
    '/activity/:activityId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    submissionsController.getSubmissionsByActivity
);

/**
 * POST /api/v1/activities/:activityId/submissions/batch-grade
 * Grade multiple submissions (instructor/admin)
 */
submissionsRoutes.post(
    '/activity/:activityId/batch-grade',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    validateBody(BatchGradeDTO),
    submissionsController.batchGradeSubmissions
);

/**
 * GET /api/v1/activities/:activityId/submissions/stats
 * Get activity submission statistics (instructor/admin)
 */
submissionsRoutes.get(
    '/activity/:activityId/stats',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    submissionsController.getActivityStats
);

/**
 * GET /api/v1/activities/:activityId/submissions/late
 * Get late submissions (instructor/admin)
 */
submissionsRoutes.get(
    '/activity/:activityId/late',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    submissionsController.getLateSubmissions
);

/**
 * GET /api/v1/activities/:activityId/submissions/ungraded
 * Get ungraded submissions (instructor/admin)
 */
submissionsRoutes.get(
    '/activity/:activityId/ungraded',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
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
submissionsRoutes.get(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    submissionsController.listSubmissions
);

module.exports = submissionsRoutes;
