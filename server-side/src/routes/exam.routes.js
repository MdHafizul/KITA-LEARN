const express = require('express');
const { examController } = require('../controllers');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { ExamCreateDTO, ExamStartDTO, ExamSubmitDTO } = require('../models/dtos');
const { z } = require('zod');

const examRoutes = express.Router();

const ExamIdDTO = z.object({ id: z.string().uuid() });
const AttemptIdDTO = z.object({ attemptId: z.string().uuid() });

/**
 * POST /api/v1/exams
 * Create new exam (Lecturer only)
 */
examRoutes.post(
  '/',
  authMiddleware,
  requireRole(['LECTURER', 'ADMIN']),
  validateBody(ExamCreateDTO),
  examController.createExam
);

/**
 * GET /api/v1/exams/:id
 * Get exam details with questions
 */
examRoutes.get(
  '/:id',
  validateParams(ExamIdDTO),
  examController.getExam
);

/**
 * POST /api/v1/exams/:id/start
 * Start exam attempt (Student only)
 */
examRoutes.post(
  '/:id/start',
  authMiddleware,
  requireRole(['STUDENT']),
  validateParams(ExamIdDTO),
  validateBody(ExamStartDTO),
  examController.startExam
);

/**
 * POST /api/v1/exams/:id/submit
 * Submit exam attempt with answers
 */
examRoutes.post(
  '/:id/submit',
  authMiddleware,
  requireRole(['STUDENT']),
  validateParams(ExamIdDTO),
  validateBody(ExamSubmitDTO),
  examController.submitExam
);

/**
 * GET /api/v1/exams/:id/attempts/:attemptId/results
 * Get exam results
 */
examRoutes.get(
  '/:id/attempts/:attemptId/results',
  authMiddleware,
  validateParams(ExamIdDTO.merge(AttemptIdDTO)),
  examController.getExamResults
);

/**
 * GET /api/v1/exams/:id/attempts
 * Get all exam attempts for user
 */
examRoutes.get(
  '/:id/attempts',
  authMiddleware,
  validateParams(ExamIdDTO),
  examController.getUserAttempts
);

module.exports = examRoutes;
