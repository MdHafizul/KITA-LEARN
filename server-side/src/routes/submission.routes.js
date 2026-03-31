const express = require('express');
const { submissionController } = require('../controllers');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { SubmitAssignmentDTO, GradeSubmissionDTO } = require('../models/dtos');
const { z } = require('zod');

const submissionRoutes = express.Router();

const SubmissionIdDTO = z.object({ submissionId: z.string().uuid() });

/**
 * POST /api/v1/submissions
 * Submit assignment
 */
submissionRoutes.post(
  '/',
  authMiddleware,
  requireRole(['STUDENT']),
  validateBody(SubmitAssignmentDTO),
  submissionController.submitAssignment
);

/**
 * GET /api/v1/submissions/:submissionId
 * Get submission details
 */
submissionRoutes.get(
  '/:submissionId',
  authMiddleware,
  validateParams(SubmissionIdDTO),
  submissionController.getSubmission
);

/**
 * POST /api/v1/submissions/:submissionId/grade
 * Grade submission (Lecturer only)
 */
submissionRoutes.post(
  '/:submissionId/grade',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateParams(SubmissionIdDTO),
  validateBody(GradeSubmissionDTO),
  submissionController.gradeSubmission
);

/**
 * GET /api/v1/submissions/assignment/:assignmentId
 * Get all submissions for assignment
 */
submissionRoutes.get(
  '/assignment/:assignmentId',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  submissionController.getAssignmentSubmissions
);

module.exports = submissionRoutes;
