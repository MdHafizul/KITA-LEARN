/**
 * CourseController - Handles course management endpoints
 * Routes: GET /courses, POST /courses, GET /courses/:id, PUT /courses/:id, DELETE /courses/:id
 */

const { statusCodes } = require('../config/constants');
const { CourseService } = require('../services');
const { CourseCreateDTO, CourseUpdateDTO } = require('../models/dtos');

class CourseController {
  /**
   * Get all courses with pagination and filters
   * GET /api/v1/courses?page=1&limit=10&search=JavaScript&status=published
   */
  static async getAllCourses(req, res, next) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const userId = req.user?.id;

      // Call service with filters
      const result = await CourseService.getAllCourses(
        {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          status,
        },
        userId
      );

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          courses: result.courses,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single course with all content
   * GET /api/v1/courses/:courseId
   */
  static async getCourseById(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      // Call service
      const course = await CourseService.getCourseById(courseId, userId);

      if (!course) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new course (Lecturer/Admin only)
   * POST /api/v1/courses
   * Body: { title, description, code, credits, category }
   */
  static async createCourse(req, res, next) {
    try {
      // Validate request
      const validated = CourseCreateDTO.parse(req.body);
      const userId = req.user.id;

      // Check if user is lecturer
      const isLecturer = req.user.role === 'lecturer' || req.user.role === 'admin';
      if (!isLecturer) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Only lecturers can create courses',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      // Call service
      const result = await CourseService.createCourse(validated, userId);

      if (!result.success) {
        return res.status(statusCodes.CONFLICT).json({
          success: false,
          error: result.error,
          code: 'COURSE_CREATION_FAILED',
        });
      }

      res.status(statusCodes.CREATED).json({
        success: true,
        data: { course: result.course },
        message: 'Course created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update course (Lecturer/Admin only)
   * PUT /api/v1/courses/:courseId
   * Body: { title, description, category, status }
   */
  static async updateCourse(req, res, next) {
    try {
      // Validate request
      const validated = CourseUpdateDTO.parse(req.body);
      const { courseId } = req.params;
      const userId = req.user.id;

      // Call service (handles authorization)
      const result = await CourseService.updateCourse(courseId, validated, userId);

      if (!result.success) {
        const statusCode = result.code === 'NOT_FOUND' ? statusCodes.NOT_FOUND : statusCodes.FORBIDDEN;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          code: result.code,
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { course: result.course },
        message: 'Course updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish course (make visible to students)
   * PATCH /api/v1/courses/:courseId/publish
   */
  static async publishCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Call service
      const result = await CourseService.publishCourse(courseId, userId);

      if (!result.success) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: result.error,
          code: 'PUBLISH_FAILED',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { course: result.course },
        message: 'Course published',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive course
   * PATCH /api/v1/courses/:courseId/archive
   */
  static async archiveCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Call service
      const result = await CourseService.archiveCourse(courseId, userId);

      if (!result.success) {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: result.error,
          code: 'ARCHIVE_FAILED',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { course: result.course },
        message: 'Course archived',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete course (Admin only)
   * DELETE /api/v1/courses/:courseId
   */
  static async deleteCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Only admin can delete
      if (req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Only admins can delete courses',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      // Call service
      const result = await CourseService.deleteCourse(courseId);

      if (!result.success) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        message: 'Course deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get course statistics (enrollment, completion, avg grade)
   * GET /api/v1/courses/:courseId/stats
   */
  static async getCourseStats(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Call service
      const stats = await CourseService.getCourseStats(courseId, userId);

      if (!stats) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
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

  /**
   * Get enrolled students for a course
   * GET /api/v1/courses/:courseId/students
   */
  static async getCourseStudents(req, res, next) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      // Call service
      const result = await CourseService.getCourseStudents(courseId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      if (!result) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Course not found',
          code: 'COURSE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          students: result.students,
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
}

module.exports = CourseController;
