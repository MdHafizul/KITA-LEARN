/**
 * SubmissionController - Handles assignment submissions
 */

const { statusCodes } = require('../config/constants');
const { SubmissionService } = require('../services');

class SubmissionController {
  /**
   * Get all submissions for an assignment
   * GET /api/v1/submissions?assignmentId=...&page=1&limit=20
   */
  static async getAllSubmissions(req, res, next) {
    try {
      const { assignmentId, page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const result = await SubmissionService.getAllSubmissions(
        assignmentId,
        { page: parseInt(page), limit: parseInt(limit) },
        userId
      );

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          submissions: result.submissions,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit assignment
   * POST /api/v1/submissions
   * Body: { assignmentId, content, attachmentUrl }
   */
  static async submitAssignment(req, res, next) {
    try {
      const { assignmentId, content, attachmentUrl } = req.body;
      const userId = req.user.id;

      if (!assignmentId || !content) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'assignmentId and content required',
          code: 'INVALID_REQUEST',
        });
      }

      const result = await SubmissionService.submitAssignment(
        assignmentId,
        userId,
        { content, attachmentUrl }
      );

      if (!result.success) {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.CREATED).json({
        success: true,
        data: { submission: result.submission },
        message: 'Assignment submitted',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Grade submission
   * PATCH /api/v1/submissions/:submissionId/grade
   * Body: { score, feedback }
   */
  static async gradeSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      const userId = req.user.id;

      if (score === undefined || !feedback) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'score and feedback required',
          code: 'INVALID_REQUEST',
        });
      }

      const result = await SubmissionService.gradeSubmission(
        submissionId,
        userId,
        { score, feedback }
      );

      if (!result.success) {
        return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { submission: result.submission },
        message: 'Submission graded',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's submissions
   * GET /api/v1/submissions/user/:userId
   */
  static async getUserSubmissions(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await SubmissionService.getUserSubmissions(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          submissions: result.submissions,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubmissionController;
