/**
 * EnrollmentController - Handles course enrollments and progress tracking
 */

const { statusCodes } = require('../config/constants');
const { EnrollmentService } = require('../services');

class EnrollmentController {
  /**
   * Get student enrollments
   * GET /api/v1/enrollments?studentId=...&page=1&limit=10
   */
  static async getStudentEnrollments(req, res, next) {
    try {
      const { studentId, page = 1, limit = 10 } = req.query;
      const userId = req.user.id;

      const result = await EnrollmentService.getStudentEnrollments(
        studentId || userId,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          enrollments: result.enrollments,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get course enrollments (Lecturer view)
   * GET /api/v1/enrollments/course/:courseId
   */
  static async getCourseEnrollments(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.id;

      const result = await EnrollmentService.getCourseEnrollments(
        courseId,
        userId,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      if (!result.success) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: result.error,
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          enrollments: result.enrollments,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enroll student in course
   * POST /api/v1/enrollments
   * Body: { courseId, studentId } (studentId optional, defaults to current user)
   */
  static async enrollStudent(req, res, next) {
    try {
      const { courseId, studentId } = req.body;
      const userId = req.user.id;

      if (!courseId) {
        return res.status(statusCodes.BAD_REQUEST).json({
          success: false,
          error: 'courseId required',
          code: 'INVALID_REQUEST',
        });
      }

      const result = await EnrollmentService.enrollStudent(
        courseId,
        studentId || userId
      );

      if (!result.success) {
        const code = result.code;
        const status =
          code === 'ALREADY_ENROLLED' ? statusCodes.CONFLICT :
          code === 'COURSE_NOT_FOUND' ? statusCodes.NOT_FOUND :
          statusCodes.UNPROCESSABLE_ENTITY;

        return res.status(status).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.CREATED).json({
        success: true,
        data: { enrollment: result.enrollment },
        message: 'Student enrolled',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get enrollment progress
   * GET /api/v1/enrollments/:enrollmentId/progress
   */
  static async getEnrollmentProgress(req, res, next) {
    try {
      const { enrollmentId } = req.params;

      const progress = await EnrollmentService.getEnrollmentProgress(enrollmentId);

      if (!progress) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Enrollment not found',
          code: 'ENROLLMENT_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { progress },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unenroll student from course (Student/Admin)
   * DELETE /api/v1/enrollments/:enrollmentId
   */
  static async unenrollStudent(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;

      const result = await EnrollmentService.unenrollStudent(enrollmentId, userId);

      if (!result.success) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: result.error,
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        message: 'Student unenrolled',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EnrollmentController;
