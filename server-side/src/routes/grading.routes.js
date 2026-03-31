const express = require('express');
const { gradingController } = require('../controllers');
const { validateParams, validateQuery } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { PaginationDTO } = require('../models/dtos');
const { z } = require('zod');

const gradingRoutes = express.Router();

const CourseIdDTO = z.object({ courseId: z.string().uuid() });
const StudentIdDTO = z.object({ studentId: z.string().uuid() });

/**
 * GET /api/v1/grading/courses/:courseId/grades
 * Get all grades for course
 */
gradingRoutes.get(
  '/courses/:courseId/grades',
  authMiddleware,
  validateParams(CourseIdDTO),
  validateQuery(PaginationDTO),
  gradingController.getCourseGrades
);

/**
 * GET /api/v1/grading/courses/:courseId/students/:studentId
 * Get student grades for course
 */
gradingRoutes.get(
  '/courses/:courseId/students/:studentId',
  authMiddleware,
  validateParams(CourseIdDTO.merge(StudentIdDTO)),
  gradingController.getStudentGrades
);

/**
 * GET /api/v1/grading/courses/:courseId/stats
 * Get grading statistics for course
 */
gradingRoutes.get(
  '/courses/:courseId/stats',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(CourseIdDTO),
  gradingController.getCourseGradeStats
);

/**
 * GET /api/v1/grading/students/:studentId/gpa
 * Get student GPA
 */
gradingRoutes.get(
  '/students/:studentId/gpa',
  authMiddleware,
  validateParams(StudentIdDTO),
  gradingController.getStudentGPA
);

module.exports = gradingRoutes;
