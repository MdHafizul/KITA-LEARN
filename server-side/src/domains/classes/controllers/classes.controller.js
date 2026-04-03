/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Classes Controller
 * HTTP request/response handlers for Classes domain
 * Handles validation, status codes, error propagation
 */

const classesService = require('../services/classes.service');
const {
  ClassCreateDTO,
  ClassUpdateDTO,
  ClassFilterDTO,
  BulkClassCreateDTO,
  ClassEnrollmentCreateDTO,
  BulkClassEnrollmentDTO,
  ClassSessionCreateDTO,
  ClassSessionUpdateDTO,
} = require('../dtos/classes.dtos');

class ClassesController {
  // ============================================
  // CLASS HANDLERS
  // ============================================

  /**
   * GET /api/v1/classes/:classId
   * Get a specific class by ID
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getClass(req, res, next) {
    try {
      const { classId } = req.params;
      const cls = await classesService.getClassById(classId);
      res.status(200).json({ success: true, data: cls });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/courses/:courseId/classes
   * Get all classes for a course
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getClassesByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await classesService.getClassesByCourse(courseId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes
   * Filter classes with advanced options
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async filterClasses(req, res, next) {
    try {
      const filters = ClassFilterDTO.parse(req.query);
      const result = await classesService.filterClasses(filters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/courses/:courseId/classes
   * Create a new class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async createClass(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const data = ClassCreateDTO.parse(req.body);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const cls = await classesService.createClass(courseId, data, lecturerProfile.id, isAdmin);
      res.status(201).json({ success: true, data: cls, message: 'Class created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/courses/:courseId/classes/bulk
   * Bulk create classes (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async createBulkClasses(req, res, next) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const { classes } = BulkClassCreateDTO.parse(req.body);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const result = await classesService.createBulkClasses(courseId, classes, lecturerProfile.id, isAdmin);
      res
        .status(201)
        .json({ success: true, data: result, message: 'Classes created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/classes/:classId
   * Update a class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async updateClass(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const data = ClassUpdateDTO.parse(req.body);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const cls = await classesService.updateClass(classId, data, lecturerProfile.id, isAdmin);
      res.status(200).json({ success: true, data: cls, message: 'Class updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/classes/:classId
   * Delete a class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async deleteClass(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      await classesService.deleteClass(classId, lecturerProfile.id, isAdmin);
      res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes/:classId/details
   * Get class with all relations (for admin view)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getClassDetails(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;

      const cls = await classesService.getClassDetails(classId, userId);
      res.status(200).json({ success: true, data: cls });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ENROLLMENT HANDLERS
  // ============================================

  /**
   * POST /api/v1/classes/:classId/enroll
   * Enroll student in a class
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async enrollInClass(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;

      const enrollment = await classesService.enrollStudentInClass(classId, userId);
      res
        .status(201)
        .json({ success: true, data: enrollment, message: 'Enrolled in class successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/classes/:classId/bulk-enroll
   * Bulk enroll students in a class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async bulkEnrollStudents(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const { userIds } = BulkClassEnrollmentDTO.parse(req.body);

      const result = await classesService.bulkEnrollStudents(classId, userIds, userId);
      res.status(201).json({ success: true, data: result, message: 'Students enrolled successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes/:classId/enrollments
   * Get all enrollments for a class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getEnrollments(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await classesService.getEnrollmentsByClass(classId, userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/enrollments/:enrollmentId
   * Update enrollment status (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async updateEnrollmentStatus(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const enrollment = await classesService.updateEnrollmentStatus(enrollmentId, status, lecturerProfile.id, isAdmin);
      res.status(200).json({ success: true, data: enrollment, message: 'Enrollment updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/enrollments/:enrollmentId
   * Remove student from class (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async removeFromClass(req, res, next) {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;

      await classesService.removeStudentFromClass(enrollmentId, userId);
      res.status(200).json({ success: true, message: 'Student removed from class' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes/me
   * Get all classes for the current student
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getMyClasses(req, res, next) {
    try {
      const userId = req.user.id;
      const classes = await classesService.getMyClasses(userId);
      res.status(200).json({ success: true, data: classes });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // SESSION HANDLERS
  // ============================================

  /**
   * POST /api/v1/classes/:classId/sessions
   * Create a class session (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async createSession(req, res, next) {
    try {
      const { classId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const data = ClassSessionCreateDTO.parse(req.body);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const session = await classesService.createSession(classId, data, lecturerProfile.id, isAdmin);
      res
        .status(201)
        .json({ success: true, data: session, message: 'Session created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes/:classId/sessions
   * Get all sessions for a class
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getSessionsByClass(req, res, next) {
    try {
      const { classId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await classesService.getSessionsByClass(classId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sessions/:sessionId
   * Get a specific session
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const session = await classesService.getSessionById(sessionId);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/classes/:classId/sessions/upcoming
   * Get upcoming sessions for a class
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async getUpcomingSessions(req, res, next) {
    try {
      const { classId } = req.params;
      const sessions = await classesService.getUpcomingSessions(classId);
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/sessions/:sessionId
   * Update a session (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async updateSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;
      const data = ClassSessionUpdateDTO.parse(req.body);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      const session = await classesService.updateSession(sessionId, data, lecturerProfile.id, isAdmin);
      res.status(200).json({ success: true, data: session, message: 'Session updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/sessions/:sessionId
   * Delete a session (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.isAdmin || false;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const lecturerProfile = await prisma.lecturerProfile.findUnique({
        where: { userId }
      });

      if (!lecturerProfile) {
        return res.status(403).json({
          success: false,
          message: 'Lecturer profile not found'
        });
      }

      await classesService.deleteSession(sessionId, lecturerProfile.id, isAdmin);
      res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/sessions/:sessionId/attendance
   * Record attendance for a session (Lecturer-only)
   */
  /**
   * Desc: Controller function orchestrates request handling and JSON response mapping.
   * Params: Read required path/query values from req.params and req.query.
   * Body: Read request payload from req.body and validate via DTO/Zod before service call.
   * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
   */
  async recordAttendance(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { attendanceCount } = req.body;

      const session = await classesService.recordAttendance(sessionId, attendanceCount, userId);
      res.status(200).json({ success: true, data: session, message: 'Attendance recorded' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClassesController();

