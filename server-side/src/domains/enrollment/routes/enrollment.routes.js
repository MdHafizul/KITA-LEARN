/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Enrollment Routes
 * HTTP routes for enrollment endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent, requireRole } = require('../../../middleware/auth.middleware');
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.patch(
    '/:id/suspend',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(EnrollmentIdDTO),
    enrollmentController.suspendEnrollment
);

/**
 * PATCH /api/v1/enrollments/:id/complete
 * Mark enrollment as completed (student/instructor/admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.patch(
    '/:id/drop',
    authMiddleware,
    validateParams(EnrollmentIdDTO),
    enrollmentController.dropEnrollment
);

/**
 * DELETE /api/v1/enrollments/:id
 * Delete enrollment (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.post(
    '/',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateBody(EnrollmentCreateDTO),
    enrollmentController.enrollUser
);

/**
 * GET /api/v1/me/enrollments/count
 * Get current user's active enrollment count
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.get(
    '/course/:courseId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    enrollmentController.getEnrollmentsByCourse
);

/**
 * POST /api/v1/courses/:courseId/enrollments/bulk
 * Bulk enroll students in a course (instructor/admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.post(
    '/course/:courseId/bulk',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    validateBody(BulkEnrollmentDTO),
    enrollmentController.bulkEnroll
);

/**
 * GET /api/v1/courses/:courseId/enrollments/stats
 * Get enrollment statistics for a course (instructor/admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.get(
    '/course/:courseId/stats',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
enrollmentRoutes.get(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    enrollmentController.listEnrollments
);

module.exports = enrollmentRoutes;


