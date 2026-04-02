/**
 * GradingController - Handles grade operations and reporting
 */

const { statusCodes } = require('../config/constants');
const { GradingService } = require('../services');

class GradingController {
  /**
   * Get grades for a course
   * GET /api/v1/grades?courseId=...&page=1&limit=50
   */
  async getCourseGrades(req, res, next) {
    try {
      const { courseId, page = 1, limit = 50 } = req.query;
      const userId = req.user.id;

      const result = await GradingService.getCourseGrades(courseId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          grades: result.grades,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student GPA for a course
   * GET /api/v1/grades/:studentId/course/:courseId/gpa
   */
  async getStudentGPA(req, res, next) {
    try {
      const { studentId, courseId } = req.params;

      const gpa = await GradingService.calculateStudentGPA(studentId, courseId);

      if (!gpa) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'GPA data not found',
          code: 'NO_GPA_DATA',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { gpa },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student grades for a specific course
   * GET /api/v1/grading/courses/:courseId/students/:studentId
   */
  async getStudentGrades(req, res, next) {
    try {
      const { courseId, studentId } = req.params;
      const userId = req.user.id;

      const grades = await GradingService.getStudentGrades(studentId, courseId, userId);

      res.status(statusCodes.OK).json({
        success: true,
        data: { grades },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get grade statistics for a course
   * GET /api/v1/grades/:courseId/statistics
   */
  async getCourseGradeStats(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const stats = await GradingService.getGradeStatistics(courseId, userId);

      if (!stats) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { statistics: stats },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export grades to CSV
   * GET /api/v1/grades/:courseId/export
   */
  async exportGrades(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const csvData = await GradingService.exportGradesToCSV(courseId, userId);

      if (!csvData) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="grades_${courseId}.csv"`);
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GradingController();


