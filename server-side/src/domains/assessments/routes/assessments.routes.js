/**
 * Assessments Routes
 * HTTP routes for exam endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
const assessmentsController = require('../controllers/assessments.controller');
const {
    ExamCreateDTO,
    ExamUpdateDTO,
    ExamQuestionCreateDTO,
    ExamQuestionUpdateDTO,
    ExamAttemptStartDTO,
    ExamAttemptSubmitDTO,
    GradingSchemeCreateDTO,
    GradingSchemeUpdateDTO
} = require('../dtos/assessments.dtos');
const { z } = require('zod');

const assessmentsRoutes = express.Router();

const ExamIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const ExamIdParamDTO = z.object({
    examId: z.union([z.string().cuid(), z.string().uuid()])
});

const QuestionIdDTO = z.object({
    questionId: z.union([z.string().cuid(), z.string().uuid()])
});

const AttemptIdDTO = z.object({
    attemptId: z.union([z.string().cuid(), z.string().uuid()])
});

const SchemeIdDTO = z.object({
    schemeId: z.union([z.string().cuid(), z.string().uuid()])
});

/**
 * POST /api/v1/exams
 * Create new exam (Lecturer only)
 */
assessmentsRoutes.post(
    '/',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateBody(ExamCreateDTO),
    assessmentsController.createExam
);

/**
 * GET /api/v1/exams/:id
 * Get exam by ID
 */
assessmentsRoutes.get(
    '/:id',
    validateParams(ExamIdDTO),
    assessmentsController.getExam
);

/**
 * PUT /api/v1/exams/:id
 * Update exam (Lecturer only)
 */
assessmentsRoutes.put(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ExamIdDTO),
    validateBody(ExamUpdateDTO),
    assessmentsController.updateExam
);

/**
 * DELETE /api/v1/exams/:id
 * Delete exam (Lecturer only)
 */
assessmentsRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ExamIdDTO),
    assessmentsController.deleteExam
);

/**
 * GET /api/v1/exams/:id/stats
 * Get exam statistics
 */
assessmentsRoutes.get(
    '/:id/stats',
    validateParams(ExamIdDTO),
    assessmentsController.getExamStats
);

/**
 * POST /api/v1/exams/:examId/questions
 * Create exam question (Lecturer only)
 */
assessmentsRoutes.post(
    '/:examId/questions',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ExamIdParamDTO),
    validateBody(ExamQuestionCreateDTO),
    assessmentsController.createQuestion
);

/**
 * GET /api/v1/exams/:examId/questions
 * Get exam questions
 */
assessmentsRoutes.get(
    '/:examId/questions',
    validateParams(ExamIdParamDTO),
    assessmentsController.getQuestions
);

/**
 * PUT /api/v1/exams/questions/:questionId
 * Update exam question (Lecturer only)
 */
assessmentsRoutes.put(
    '/questions/:questionId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(QuestionIdDTO),
    validateBody(ExamQuestionUpdateDTO),
    assessmentsController.updateQuestion
);

/**
 * DELETE /api/v1/exams/questions/:questionId
 * Delete exam question (Lecturer only)
 */
assessmentsRoutes.delete(
    '/questions/:questionId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(QuestionIdDTO),
    assessmentsController.deleteQuestion
);

/**
 * POST /api/v1/exams/:examId/start
 * Start exam attempt (Student only)
 */
assessmentsRoutes.post(
    '/:examId/start',
    authMiddleware,
    requireRole(['STUDENT']),
    validateParams(ExamIdParamDTO),
    assessmentsController.startAttempt
);

/**
 * POST /api/v1/exams/:examId/submit
 * Submit exam attempt (Student only)
 */
assessmentsRoutes.post(
    '/:examId/submit',
    authMiddleware,
    requireRole(['STUDENT']),
    validateParams(ExamIdParamDTO),
    validateBody(ExamAttemptSubmitDTO),
    assessmentsController.submitAttempt
);

/**
 * GET /api/v1/exams/:examId/attempts
 * Get user attempts for exam
 */
assessmentsRoutes.get(
    '/:examId/attempts',
    authMiddleware,
    requireRole(['STUDENT']),
    validateParams(ExamIdParamDTO),
    assessmentsController.getUserAttempts
);

/**
 * GET /api/v1/exams/attempts/:attemptId/results
 * Get attempt results
 */
assessmentsRoutes.get(
    '/attempts/:attemptId/results',
    authMiddleware,
    validateParams(AttemptIdDTO),
    assessmentsController.getAttemptResults
);

/**
 * POST /api/v1/exams/:examId/grading-schemes
 * Create grading scheme (Lecturer only)
 */
assessmentsRoutes.post(
    '/:examId/grading-schemes',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ExamIdParamDTO),
    validateBody(GradingSchemeCreateDTO),
    assessmentsController.createGradingScheme
);

/**
 * GET /api/v1/exams/:examId/grading-schemes
 * Get grading schemes for exam
 */
assessmentsRoutes.get(
    '/:examId/grading-schemes',
    validateParams(ExamIdParamDTO),
    assessmentsController.getGradingSchemes
);

/**
 * PUT /api/v1/exams/grading-schemes/:schemeId
 * Update grading scheme (Lecturer only)
 */
assessmentsRoutes.put(
    '/grading-schemes/:schemeId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(SchemeIdDTO),
    validateBody(GradingSchemeUpdateDTO),
    assessmentsController.updateGradingScheme
);

/**
 * DELETE /api/v1/exams/grading-schemes/:schemeId
 * Delete grading scheme (Lecturer only)
 */
assessmentsRoutes.delete(
    '/grading-schemes/:schemeId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(SchemeIdDTO),
    assessmentsController.deleteGradingScheme
);

module.exports = assessmentsRoutes;
