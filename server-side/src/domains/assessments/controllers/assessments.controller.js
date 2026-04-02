/**
 * Assessments Controller
 * HTTP handlers for exam endpoints
 */

const { statusCodes } = require('../../../config/constants');
const assessmentsService = require('../services/assessments.service');
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

class AssessmentsController {
    /**
     * GET /api/v1/exams/:id
     * Get exam by ID
     */
    async getExam(req, res, next) {
        try {
            const { id } = req.params;

            const exam = await assessmentsService.getExamById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { exam }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/exams
     * Create new exam (Lecturer only)
     */
    async createExam(req, res, next) {
        try {
            const validated = ExamCreateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const exam = await assessmentsService.createExam(validated, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { exam },
                message: 'Exam created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/exams/:id
     * Update exam (Lecturer only)
     */
    async updateExam(req, res, next) {
        try {
            const { id } = req.params;
            const validated = ExamUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const exam = await assessmentsService.updateExam(id, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { exam },
                message: 'Exam updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/exams/:id
     * Delete exam (Lecturer only)
     */
    async deleteExam(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await assessmentsService.deleteExam(id, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Exam deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/exams/:examId/questions
     * Create exam question (Lecturer only)
     */
    async createQuestion(req, res, next) {
        try {
            const { examId } = req.params;
            const validated = ExamQuestionCreateDTO.parse({
                examId,
                ...req.body
            });
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const question = await assessmentsService.createQuestion(examId, {
                question: validated.questionText,
                questionOrder: validated.displayOrder,
                questionType: validated.type,
                options: validated.options,
                difficulty: validated.difficulty,
                explanation: validated.explanation,
                points: validated.points
            }, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { question },
                message: 'Question created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/exams/:examId/questions
     * Get exam questions
     */
    async getQuestions(req, res, next) {
        try {
            const { examId } = req.params;

            const questions = await assessmentsService.getQuestions(examId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { questions }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/exams/questions/:questionId
     * Update exam question (Lecturer only)
     */
    async updateQuestion(req, res, next) {
        try {
            const { questionId } = req.params;
            const validated = ExamQuestionUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const question = await assessmentsService.updateQuestion(questionId, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { question },
                message: 'Question updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/exams/questions/:questionId
     * Delete exam question (Lecturer only)
     */
    async deleteQuestion(req, res, next) {
        try {
            const { questionId } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await assessmentsService.deleteQuestion(questionId, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Question deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/exams/:examId/start
     * Start exam attempt
     */
    async startAttempt(req, res, next) {
        try {
            const { examId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const attempt = await assessmentsService.startAttempt(examId, userId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { attempt },
                message: 'Exam attempt started'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/exams/:examId/submit
     * Submit exam attempt
     */
    async submitAttempt(req, res, next) {
        try {
            const { examId } = req.params;
            const { attemptId, answers } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const result = await assessmentsService.submitAttempt(attemptId, answers, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { result },
                message: 'Exam submitted and graded'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/exams/:examId/attempts
     * Get user attempts for exam
     */
    async getUserAttempts(req, res, next) {
        try {
            const { examId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const attempts = await assessmentsService.getUserAttempts(examId, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { attempts }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/exams/attempts/:attemptId/results
     * Get attempt results
     */
    async getAttemptResults(req, res, next) {
        try {
            const { attemptId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            const result = await assessmentsService.getAttemptResults(attemptId, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { result }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/exams/:id/stats
     * Get exam statistics
     */
    async getExamStats(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await assessmentsService.getExamStats(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/grading-schemes
     * Create grading scheme
     */
    async createGradingScheme(req, res, next) {
        try {
            const validated = GradingSchemeCreateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const scheme = await assessmentsService.createGradingScheme({
                schemeName: validated.schemeName,
                gradeMinimum: validated.gradeMinimum,
                gradeMaximum: validated.gradeMaximum,
                letterGrade: validated.letterGrade
            }, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { scheme },
                message: 'Grading scheme created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/grading-schemes
     * Get grading schemes
     */
    async getGradingSchemes(req, res, next) {
        try {
            const schemes = await assessmentsService.getGradingSchemes();

            res.status(statusCodes.OK).json({
                success: true,
                data: { schemes }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/exams/grading-schemes/:schemeId
     * Update grading scheme (Lecturer only)
     */
    async updateGradingScheme(req, res, next) {
        try {
            const { schemeId } = req.params;
            const validated = GradingSchemeUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const scheme = await assessmentsService.updateGradingScheme(schemeId, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { scheme },
                message: 'Grading scheme updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/exams/grading-schemes/:schemeId
     * Delete grading scheme (Lecturer only)
     */
    async deleteGradingScheme(req, res, next) {
        try {
            const { schemeId } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await assessmentsService.deleteGradingScheme(schemeId, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Grading scheme deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AssessmentsController();
