const express = require('express');
const { enrollmentController } = require('../controllers');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { EnrollStudentDTO, PaginationDTO } = require('../models/dtos');
const { z } = require('zod');

const enrollmentRoutes = express.Router();

const CourseIdDTO = z.object({ courseId: z.string().uuid() });
const EnrollmentIdDTO = z.object({ enrollmentId: z.string().uuid() });

/**
 * POST /api/v1/enrollments
 * Enroll student in course
 */
enrollmentRoutes.post(
  '/',
  authMiddleware,
  validateBody(EnrollStudentDTO),
  enrollmentController.enrollStudent
);

/**
 * GET /api/v1/enrollments/courses/:courseId
 * Get all students enrolled in course
 */
enrollmentRoutes.get(
  '/courses/:courseId',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(CourseIdDTO),
  validateQuery(PaginationDTO),
  enrollmentController.getCourseEnrollments
);

/**
 * GET /api/v1/enrollments/:enrollmentId/progress
 * Get student progress in course
 */
enrollmentRoutes.get(
  '/:enrollmentId/progress',
  authMiddleware,
  validateParams(EnrollmentIdDTO),
  enrollmentController.getEnrollmentProgress
);

/**
 * POST /api/v1/enrollments/:enrollmentId/complete
 * Mark enrollment as complete
 */
enrollmentRoutes.post(
  '/:enrollmentId/complete',
  authMiddleware,
  validateParams(EnrollmentIdDTO),
  enrollmentController.completeEnrollment
);

/**
 * DELETE /api/v1/enrollments/:enrollmentId
 * Unenroll student from course
 */
enrollmentRoutes.delete(
  '/:enrollmentId',
  authMiddleware,
  validateParams(EnrollmentIdDTO),
  enrollmentController.unenrollStudent
);

module.exports = enrollmentRoutes;
