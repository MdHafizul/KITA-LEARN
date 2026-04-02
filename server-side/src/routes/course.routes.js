const express = require('express');
const { courseController } = require('../controllers');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { CourseCreateDTO, CourseUpdateDTO, PaginationDTO } = require('../models/dtos');
const { z } = require('zod');

const courseRoutes = express.Router();

const CourseIdDTO = z.object({ id: z.union([z.string().cuid(), z.string().uuid()]) });

/**
 * GET /api/v1/courses
 * List all published courses with pagination
 */
courseRoutes.get(
  '/',
  validateQuery(PaginationDTO),
  courseController.listCourses
);

/**
 * POST /api/v1/courses
 * Create new course (Lecturer only)
 */
courseRoutes.post(
  '/',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateBody(CourseCreateDTO),
  courseController.createCourse
);

/**
 * GET /api/v1/courses/:id
 * Get course details with materials
 */
courseRoutes.get(
  '/:id',
  validateParams(CourseIdDTO),
  courseController.getCourse
);

/**
 * PUT /api/v1/courses/:id
 * Update course (Lecturer/Owner only)
 */
courseRoutes.put(
  '/:id',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(CourseIdDTO),
  validateBody(CourseUpdateDTO),
  courseController.updateCourse
);

/**
 * POST /api/v1/courses/:id/publish
 * Publish course (Make it available to students)
 */
courseRoutes.post(
  '/:id/publish',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(CourseIdDTO),
  courseController.publishCourse
);

/**
 * POST /api/v1/courses/:id/archive
 * Archive course (Hide from students)
 */
courseRoutes.post(
  '/:id/archive',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(CourseIdDTO),
  courseController.archiveCourse
);

/**
 * DELETE /api/v1/courses/:id
 * Delete course (Admin only)
 */
courseRoutes.delete(
  '/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  validateParams(CourseIdDTO),
  courseController.deleteCourse
);

module.exports = courseRoutes;
