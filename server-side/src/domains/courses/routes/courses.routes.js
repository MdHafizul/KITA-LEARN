/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Courses Routes
 * HTTP routes for course endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent, isAdmin } = require('../../../middleware/auth.middleware');
const coursesController = require('../controllers/courses.controller');
const {
    CourseCreateDTO,
    CourseUpdateDTO,
    CoursePrerequisiteCreateDTO,
    CourseMaterialCreateDTO,
    CourseMaterialUpdateDTO
} = require('../dtos/courses.dtos');
const { z } = require('zod');

const coursesRoutes = express.Router();

const CourseIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const CourseIdParamDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()])
});

const MaterialIdDTO = z.object({
    materialId: z.union([z.string().cuid(), z.string().uuid()])
});

const LecturerIdDTO = z.object({
    lecturerId: z.union([z.string().cuid(), z.string().uuid()])
});

/**
 * GET /api/v1/courses
 * Get all published courses
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/',
    coursesController.getAllCourses
);

/**
 * POST /api/v1/courses
 * Create new course (Lecturer/Admin only)
 */
coursesRoutes.post(
    '/',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(CourseCreateDTO),
    coursesController.createCourse
);

/**
 * GET /api/v1/courses/:id
 * Get course by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/:id',
    validateParams(CourseIdDTO),
    coursesController.getCourse
);

/**
 * PUT /api/v1/courses/:id
 * Update course (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.put(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    validateBody(CourseUpdateDTO),
    coursesController.updateCourse
);

/**
 * POST /api/v1/courses/:id/publish
 * Publish course (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.post(
    '/:id/publish',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    coursesController.publishCourse
);

/**
 * POST /api/v1/courses/:id/archive
 * Archive course (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.post(
    '/:id/archive',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    coursesController.archiveCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Delete course (Lecturer/Admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdDTO),
    coursesController.deleteCourse
);

/**
 * GET /api/v1/courses/:id/stats
 * Get course statistics
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/:id/stats',
    validateParams(CourseIdDTO),
    coursesController.getCourseStats
);

/**
 * GET /api/v1/lecturers/:lecturerId/courses
 * Get courses by lecturer
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/lecturer/:lecturerId',
    validateParams(LecturerIdDTO),
    coursesController.getCoursesByLecturer
);

/**
 * GET /api/v1/courses/:courseId/prerequisites
 * Get course prerequisites
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/:courseId/prerequisites',
    validateParams(CourseIdParamDTO),
    coursesController.getPrerequisites
);

/**
 * POST /api/v1/courses/:courseId/prerequisites
 * Add course prerequisite (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.post(
    '/:courseId/prerequisites',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdParamDTO),
    validateBody(CoursePrerequisiteCreateDTO),
    coursesController.addPrerequisite
);

/**
 * GET /api/v1/courses/:courseId/materials
 * Get course materials
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.get(
    '/:courseId/materials',
    validateParams(CourseIdParamDTO),
    coursesController.getMaterials
);

/**
 * POST /api/v1/courses/:courseId/materials
 * Add course material (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.post(
    '/:courseId/materials',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(CourseIdParamDTO),
    validateBody(CourseMaterialCreateDTO),
    coursesController.addMaterial
);

/**
 * PUT /api/v1/courses/materials/:materialId
 * Update course material (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.put(
    '/materials/:materialId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(MaterialIdDTO),
    validateBody(CourseMaterialUpdateDTO),
    coursesController.updateMaterial
);

/**
 * DELETE /api/v1/courses/materials/:materialId
 * Delete course material (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
coursesRoutes.delete(
    '/materials/:materialId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(MaterialIdDTO),
    coursesController.deleteMaterial
);

module.exports = coursesRoutes;


