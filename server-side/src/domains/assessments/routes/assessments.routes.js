/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Assessments Routes
 * HTTP routes for exam endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent } = require('../../../middleware/auth.middleware');
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.post(
    '/',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(ExamCreateDTO),
    assessmentsController.createExam
);

/**
 * GET /api/v1/exams
 * Get all exams
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.get(
    '/',
    assessmentsController.getAllExams
);


/**
 * GET /api/v1/exams/:id
 * Get exam by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.put(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ExamIdDTO),
    validateBody(ExamUpdateDTO),
    assessmentsController.updateExam
);

/**
 * DELETE /api/v1/exams/:id
 * Delete exam (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ExamIdDTO),
    assessmentsController.deleteExam
);

/**
 * GET /api/v1/exams/:id/stats
 * Get exam statistics
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.post(
    '/:examId/questions',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ExamIdParamDTO),
    validateBody(ExamQuestionCreateDTO),
    assessmentsController.createQuestion
);

/**
 * GET /api/v1/exams/:examId/questions
 * Get exam questions
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.put(
    '/questions/:questionId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(QuestionIdDTO),
    validateBody(ExamQuestionUpdateDTO),
    assessmentsController.updateQuestion
);

/**
 * DELETE /api/v1/exams/questions/:questionId
 * Delete exam question (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.delete(
    '/questions/:questionId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(QuestionIdDTO),
    assessmentsController.deleteQuestion
);

/**
 * POST /api/v1/exams/:examId/start
 * Start exam attempt (Student only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.post(
    '/:examId/start',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateParams(ExamIdParamDTO),
    assessmentsController.startAttempt
);

/**
 * POST /api/v1/exams/:examId/submit
 * Submit exam attempt (Student only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.post(
    '/:examId/submit',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateParams(ExamIdParamDTO),
    validateBody(ExamAttemptSubmitDTO),
    assessmentsController.submitAttempt
);

/**
 * GET /api/v1/exams/:examId/attempts
 * Get user attempts for exam
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.get(
    '/:examId/attempts',
    authMiddleware,
    adminBypass,
    authorizeStudent,
    validateParams(ExamIdParamDTO),
    assessmentsController.getUserAttempts
);

/**
 * GET /api/v1/exams/attempts/:attemptId/results
 * Get attempt results
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.post(
    '/:examId/grading-schemes',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ExamIdParamDTO),
    validateBody(GradingSchemeCreateDTO),
    assessmentsController.createGradingScheme
);

/**
 * GET /api/v1/exams/:examId/grading-schemes
 * Get grading schemes for exam
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.put(
    '/grading-schemes/:schemeId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(SchemeIdDTO),
    validateBody(GradingSchemeUpdateDTO),
    assessmentsController.updateGradingScheme
);

/**
 * DELETE /api/v1/exams/grading-schemes/:schemeId
 * Delete grading scheme (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
assessmentsRoutes.delete(
    '/grading-schemes/:schemeId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(SchemeIdDTO),
    assessmentsController.deleteGradingScheme
);

module.exports = assessmentsRoutes;


