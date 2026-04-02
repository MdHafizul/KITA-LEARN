/**
 * ExamController - Handles exam management endpoints
 * Routes: GET /exams, POST /exams, GET /exams/:id/start, POST /exams/:id/submit
 */

const { statusCodes } = require('../config/constants');
const { ExamService } = require('../services');
const { ExamCreateDTO, ExamAnswerDTO } = require('../models/dtos');

class ExamController {
  /**
   * Get all exams for a course
   * GET /api/v1/exams?courseId=...&page=1&limit=10
   */
  async getAllExams(req, res, next) {
    try {
      const { courseId, page = 1, limit = 10 } = req.query;
      const userId = req.user?.id;

      // Call service
      const result = await ExamService.getAllExams(
        courseId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
        },
        userId
      );

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          exams: result.exams,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single exam with questions
   * GET /api/v1/exams/:examId
   */
  async getExam(req, res, next) {
    try {
      const { id: examId } = req.params;

      // Call service
      const exam = await ExamService.getExamById(examId);

      if (!exam) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Exam not found',
          code: 'EXAM_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { exam },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new exam (Lecturer only)
   * POST /api/v1/exams
   * Body: { courseId, title, description, totalQuestions, passingScore, duration }
   */
  async createExam(req, res, next) {
    try {
      // Validate request
      const validated = ExamCreateDTO.parse(req.body);
      const userId = req.user.id;

      // Check if lecturer
      if (req.user.role !== 'lecturer' && req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Only lecturers can create exams',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      // Call service
      const result = await ExamService.createExam(validated, userId);

      if (!result.success) {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: result.error,
          code: 'EXAM_CREATION_FAILED',
        });
      }

      res.status(statusCodes.CREATED).json({
        success: true,
        data: { exam: result.exam },
        message: 'Exam created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start exam attempt
   * POST /api/v1/exams/:examId/start
   */
  async startExam(req, res, next) {
    try {
      const { id: examId } = req.params;
      const userId = req.user.id;

      // Call service
      const result = await ExamService.startExam(examId, userId);

      if (!result.success) {
        const code = result.code;
        const statusCode =
          code === 'EXAM_NOT_FOUND' ? statusCodes.NOT_FOUND :
            code === 'NOT_ENROLLED' ? statusCodes.FORBIDDEN :
              code === 'NO_ATTEMPTS_LEFT' ? statusCodes.CONFLICT :
                statusCodes.UNPROCESSABLE_ENTITY;

        return res.status(statusCode).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.CREATED).json({
        success: true,
        data: {
          attempt: result.attempt,
          exam: result.exam,
        },
        message: 'Exam started',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit exam answers
   * POST /api/v1/exams/:examId/submit
   * Body: { attemptId, answers: [ { questionId, selectedOptionId } ] }
   */
  async submitExam(req, res, next) {
    try {
      // Validate request
      const { attemptId, answers } = req.body;
      const { id: examId } = req.params;
      const userId = req.user.id;

      if (!attemptId || !answers || !Array.isArray(answers)) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'attemptId and answers array required',
          code: 'INVALID_REQUEST',
        });
      }

      // Call service
      const result = await ExamService.submitExam(examId, attemptId, answers, userId);

      if (!result.success) {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          attempt: result.attempt,
          score: result.score,
          passed: result.passed,
        },
        message: 'Exam submitted and graded',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exam attempts for a user
   * GET /api/v1/exams/:examId/attempts
   */
  async getUserAttempts(req, res, next) {
    try {
      const { id: examId } = req.params;
      const userId = req.user.id;

      // Call service
      const attempts = await ExamService.getExamAttempts(examId, userId);

      res.status(statusCodes.OK).json({
        success: true,
        data: { attempts },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exam results
   * GET /api/v1/exams/:examId/results
   */
  async getExamResults(req, res, next) {
    try {
      const { id: examId } = req.params;
      const userId = req.user.id;

      // Call service
      const results = await ExamService.getExamResults(examId, userId);

      if (!results) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Exam results not found',
          code: 'NO_RESULTS',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { results },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish exam (Lecturer only)
   * POST /api/v1/exams/:id/publish
   */
  async publishExam(req, res, next) {
    try {
      const { id: examId } = req.params;
      const userId = req.user.id;

      // Call service
      const result = await ExamService.publishExam(examId, userId);

      res.status(statusCodes.OK).json({
        success: true,
        data: { exam: result },
        message: 'Exam published successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete exam (Lecturer only - soft delete)
   * DELETE /api/v1/exams/:id
   */
  async deleteExam(req, res, next) {
    try {
      const { id: examId } = req.params;
      const userId = req.user.id;

      // Call service
      const result = await ExamService.deleteExam(examId, userId);

      res.status(statusCodes.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exam statistics
   * GET /api/v1/exams/:id/stats
   */
  async getExamStats(req, res, next) {
    try {
      const { id: examId } = req.params;

      // Call service
      const stats = await ExamService.getExamStats(examId);

      if (!stats) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'No statistics available for this exam',
          code: 'NO_STATS',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();


