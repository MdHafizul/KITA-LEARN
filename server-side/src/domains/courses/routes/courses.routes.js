/**
 * Courses Routes
 * HTTP routes for course endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
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
    requireRole(['LECTURER', 'ADMIN']),
    validateBody(CourseCreateDTO),
    coursesController.createCourse
);

/**
 * GET /api/v1/courses/:id
 * Get course by ID
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
coursesRoutes.put(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    validateBody(CourseUpdateDTO),
    coursesController.updateCourse
);

/**
 * POST /api/v1/courses/:id/publish
 * Publish course (Lecturer only)
 */
coursesRoutes.post(
    '/:id/publish',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    coursesController.publishCourse
);

/**
 * POST /api/v1/courses/:id/archive
 * Archive course (Lecturer only)
 */
coursesRoutes.post(
    '/:id/archive',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    coursesController.archiveCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Delete course (Lecturer/Admin only)
 */
coursesRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdDTO),
    coursesController.deleteCourse
);

/**
 * GET /api/v1/courses/:id/stats
 * Get course statistics
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
coursesRoutes.get(
    '/lecturer/:lecturerId',
    validateParams(LecturerIdDTO),
    coursesController.getCoursesByLecturer
);

/**
 * GET /api/v1/courses/:courseId/prerequisites
 * Get course prerequisites
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
coursesRoutes.post(
    '/:courseId/prerequisites',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdParamDTO),
    validateBody(CoursePrerequisiteCreateDTO),
    coursesController.addPrerequisite
);

/**
 * GET /api/v1/courses/:courseId/materials
 * Get course materials
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
coursesRoutes.post(
    '/:courseId/materials',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(CourseIdParamDTO),
    validateBody(CourseMaterialCreateDTO),
    coursesController.addMaterial
);

/**
 * PUT /api/v1/courses/materials/:materialId
 * Update course material (Lecturer only)
 */
coursesRoutes.put(
    '/materials/:materialId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(MaterialIdDTO),
    validateBody(CourseMaterialUpdateDTO),
    coursesController.updateMaterial
);

/**
 * DELETE /api/v1/courses/materials/:materialId
 * Delete course material (Lecturer only)
 */
coursesRoutes.delete(
    '/materials/:materialId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(MaterialIdDTO),
    coursesController.deleteMaterial
);

module.exports = coursesRoutes;
