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
  async listCourses(req, res, next) {
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
  async getCourse(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.user?.id;

      // Call service
      const course = await CourseService.getCourseById(courseId);

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
   * Body: { title, description, creditHours, maxStudents, difficultyLevel, startDate, endDate }
   */
  async createCourse(req, res, next) {
    try {
      // Validate request
      const validated = CourseCreateDTO.parse(req.body);
      const userId = req.user.id;

      // Route middleware already verified user is LECTURER or ADMIN via requireRole
      // Pass the normalized role from request directly to service
      const result = await CourseService.createCourse(validated, userId, req.user.role);

      res.status(statusCodes.CREATED).json({
        success: true,
        data: { course: result },
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
  async updateCourse(req, res, next) {
    try {
      // Validate request
      const validated = CourseUpdateDTO.parse(req.body);
      const { id: courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Call service (handles authorization)
      const course = await CourseService.updateCourse(courseId, validated, userId, userRole);

      res.status(statusCodes.OK).json({
        success: true,
        data: { course },
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
  async publishCourse(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Call service
      const course = await CourseService.publishCourse(courseId, userId, userRole);

      res.status(statusCodes.OK).json({
        success: true,
        data: { course },
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
  async archiveCourse(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Call service
      const course = await CourseService.archiveCourse(courseId, userId, userRole);

      res.status(statusCodes.OK).json({
        success: true,
        data: { course },
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
  async deleteCourse(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verify user is ADMIN (case-insensitive)
      if (req.user.role !== 'ADMIN') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Only admins can delete courses',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      // Call service
      await CourseService.deleteCourse(courseId, userId, userRole);

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
  async getCourseStats(req, res, next) {
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
  async getCourseStudents(req, res, next) {
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

module.exports = new CourseController();


