/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Grades Routes
 * HTTP routes for grade endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent, requireRole } = require('../../../middleware/auth.middleware');
const gradesController = require('../controllers/grades.controller');
const {
    GradeCreateDTO,
    GradeUpdateDTO,
    BulkGradeDTO
} = require('../dtos/grades.dtos');
const { z } = require('zod');

const gradesRoutes = express.Router();

const GradeIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const CourseIdDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()])
});

const ActivityIdDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()])
});

const RubricIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

// ============================================
// INDIVIDUAL GRADE OPERATIONS
// ============================================

/**
 * GET /api/v1/grades/:id
 * Get grade by ID (public - any authenticated user)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/:id',
    authMiddleware,
    validateParams(GradeIdDTO),
    gradesController.getGrade
);

/**
 * PUT /api/v1/grades/:id
 * Update grade (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.put(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(GradeIdDTO),
    validateBody(GradeUpdateDTO),
    gradesController.updateGrade
);

/**
 * DELETE /api/v1/grades/:id
 * Delete grade (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(GradeIdDTO),
    gradesController.deleteGrade
);

// ============================================
// CURRENT USER GRADE OPERATIONS
// ============================================

/**
 * GET /api/v1/me/grades
 * Get current user's grades
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/me/grades',
    authMiddleware,
    gradesController.getMyGrades
);

// ============================================
// COURSE GRADE OPERATIONS
// ============================================

/**
 * POST /api/v1/courses/:courseId/grades
 * Create grade for course (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/courses/:courseId/grades',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    validateBody(GradeCreateDTO),
    gradesController.createGrade
);

/**
 * GET /api/v1/courses/:courseId/grades
 * Get grades for course (instructor only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/courses/:courseId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    gradesController.getGradesByCourse
);

/**
 * GET /api/v1/courses/:courseId/grades/stats
 * Get grade statistics for course (instructor only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/courses/:courseId/stats',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    gradesController.getCourseGradeStats
);

/**
 * GET /api/v1/courses/:courseId/grades/unpublished
 * Get unpublished grades for review (instructor only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/courses/:courseId/grades/unpublished',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    gradesController.getUnpublishedGrades
);

// ============================================
// ACTIVITY GRADE OPERATIONS
// ============================================

/**
 * POST /api/v1/activities/:activityId/grades
 * Create grade for activity (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/activities/:activityId/grades',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    validateBody(GradeCreateDTO),
    gradesController.createGrade
);

/**
 * GET /api/v1/activities/:activityId/grades
 * Get grades for activity (instructor only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/activities/:activityId/grades',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    gradesController.getGradesByActivity
);

/**
 * GET /api/v1/activities/:activityId/grades/stats
 * Get grade statistics for activity (instructor only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/activities/:activityId/grades/stats',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    gradesController.getActivityGradeStats
);

// ============================================
// BULK GRADE OPERATIONS
// ============================================

/**
 * POST /api/v1/grades/bulk
 * Create grades in bulk (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/bulk',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(BulkGradeDTO),
    gradesController.createBulkGrades
);

/**
 * POST /api/v1/grades/publish
 * Publish grades for student visibility (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/publish',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    gradesController.publishGrades
);

/**
 * POST /api/v1/grades/unpublish
 * Unpublish grades (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/unpublish',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    gradesController.unpublishGrades
);

// ============================================
// ADMIN GRADE OPERATIONS
// ============================================

/**
 * GET /api/v1/grades
 * Get grades with filters (admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    gradesController.listGrades
);

// ============================================
// GRADING RUBRIC OPERATIONS
// ============================================

/**
 * GET /api/v1/rubrics/:id
 * Get rubric by ID (public)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/rubrics/:id',
    authMiddleware,
    validateParams(RubricIdDTO),
    gradesController.getRubric
);

/**
 * GET /api/v1/rubrics
 * Get all rubrics (public)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.get(
    '/rubrics',
    authMiddleware,
    gradesController.listRubrics
);

/**
 * POST /api/v1/rubrics
 * Create grading rubric (lecturer/admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.post(
    '/rubrics',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        criteria: z.object({}).passthrough(),
        totalPoints: z.number().int().min(1).optional()
    })),
    gradesController.createRubric
);

/**
 * PUT /api/v1/rubrics/:id
 * Update grading rubric (lecturer/admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.put(
    '/rubrics/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(RubricIdDTO),
    validateBody(z.object({
        name: z.string().min(3).optional(),
        description: z.string().optional(),
        criteria: z.object({}).passthrough().optional(),
        totalPoints: z.number().int().min(1).optional()
    })),
    gradesController.updateRubric
);

/**
 * DELETE /api/v1/rubrics/:id
 * Delete grading rubric (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
gradesRoutes.delete(
    '/rubrics/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(RubricIdDTO),
    gradesController.deleteRubric
);

module.exports = gradesRoutes;


