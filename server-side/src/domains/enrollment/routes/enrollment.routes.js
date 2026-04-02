/**
 * Enrollment Routes
 * HTTP routes for enrollment endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
const enrollmentController = require('../controllers/enrollment.controller');
const {
    EnrollmentCreateDTO,
    EnrollmentUpdateDTO,
    BulkEnrollmentDTO
} = require('../dtos/enrollment.dtos');
const { z } = require('zod');

const enrollmentRoutes = express.Router();

const EnrollmentIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const CourseIdDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()])
});

// ============================================
// INDIVIDUAL ENROLLMENT OPERATIONS
// ============================================

/**
 * GET /api/v1/enrollments/:id
 * Get single enrollment by ID (public - any authenticated user)
 */
enrollmentRoutes.get(
    '/:id',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    enrollmentController.getEnrollment
);

/**
 * PUT /api/v1/enrollments/:id
 * Update enrollment status or progress (student/instructor/admin)
 */
enrollmentRoutes.put(
    '/:id',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    validateBody(EnrollmentUpdateDTO),
    enrollmentController.updateEnrollment
);

/**
 * PATCH /api/v1/enrollments/:id/progress
 * Update enrollment progress (system/service)
 */
enrollmentRoutes.patch(
    '/:id/progress',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    enrollmentController.updateProgress
);

/**
 * PATCH /api/v1/enrollments/:id/suspend
 * Suspend enrollment (instructor/admin only)
 */
enrollmentRoutes.patch(
    '/:id/suspend',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(EnrollmentIdDTO),
    enrollmentController.suspendEnrollment
);

/**
 * PATCH /api/v1/enrollments/:id/complete
 * Mark enrollment as completed (student/instructor/admin)
 */
enrollmentRoutes.patch(
    '/:id/complete',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    enrollmentController.completeEnrollment
);

/**
 * PATCH /api/v1/enrollments/:id/drop
 * Drop enrollment (student/admin)
 */
enrollmentRoutes.patch(
    '/:id/drop',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    enrollmentController.dropEnrollment
);

/**
 * DELETE /api/v1/enrollments/:id
 * Delete enrollment (instructor/admin only)
 */
enrollmentRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(EnrollmentIdDTO),
    enrollmentController.deleteEnrollment
);

// ============================================
// CURRENT USER ENROLLMENT OPERATIONS
// ============================================

/**
 * GET /api/v1/me/enrollments
 * Get current user's enrollments (authenticated user)
 */
enrollmentRoutes.get(
    '/courses/my-enrollments',
    authMiddleware,
    enrollmentController.getMyEnrollments
);

/**
 * POST /api/v1/enrollments
 * Enroll in a course (student/admin)
 */
enrollmentRoutes.post(
    '/',
    authMiddleware,
    requireRole(['STUDENT', 'ADMIN']),
    validateBody(EnrollmentCreateDTO),
    enrollmentController.enrollUser
);

/**
 * GET /api/v1/me/enrollments/count
 * Get current user's active enrollment count
 */
enrollmentRoutes.get(
    '/me/enrollments/count',
    authMiddleware,
    enrollmentController.getMyEnrollmentCount
);

/**
 * GET /api/v1/enrollments/check
 * Check if current user is enrolled in a course
 * Query: courseId
 */
enrollmentRoutes.get(
    '/check/:courseId',
    authMiddleware,
    enrollmentController.checkEnrollment
);

// ============================================
// COURSE ENROLLMENT OPERATIONS
// ============================================

/**
 * GET /api/v1/courses/:courseId/enrollments
 * Get all enrollments for a course (instructor/admin only)
 */
enrollmentRoutes.get(
    '/course/:courseId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    enrollmentController.getEnrollmentsByCourse
);

/**
 * POST /api/v1/courses/:courseId/enrollments/bulk
 * Bulk enroll students in a course (instructor/admin only)
 */
enrollmentRoutes.post(
    '/course/:courseId/bulk',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    validateBody(BulkEnrollmentDTO),
    enrollmentController.bulkEnroll
);

/**
 * GET /api/v1/courses/:courseId/enrollments/stats
 * Get enrollment statistics for a course (instructor/admin only)
 */
enrollmentRoutes.get(
    '/course/:courseId/stats',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    enrollmentController.getCourseStats
);

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * GET /api/v1/enrollments
 * Get all enrollments with filters (admin only)
 * Query: courseId, userId, status, page, limit
 */
enrollmentRoutes.get(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    enrollmentController.listEnrollments
);

module.exports = enrollmentRoutes;
