/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Classes Service
 * Business logic layer for Class, ClassEnrollment, and ClassSession operations
 * Handles authorization, validation, and complex business rules
 */

const classesRepository = require('../repositories/classes.repository');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClassesService {
  // ============================================
  // CLASS OPERATIONS
  // ============================================

  /**
   * Create a new class (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async createClass(courseId, data, lecturerId, isAdmin = false) {
    // Verify course exists and user is the lecturer
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lecturer: true },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Authorization: Only the lecturer can create classes for their course
    if (!isAdmin && course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can create classes');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.createClass({
      courseId,
      ...data,
    });
  }

  /**
   * Create multiple classes in bulk (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async createBulkClasses(courseId, classes, lecturerId, isAdmin = false) {
    // Verify authorization
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || (!isAdmin && course.lecturerId !== lecturerId)) {
      const error = new Error('Only the course lecturer can create classes');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.createBulkClasses(courseId, classes);
  }

  /**
   * Get class by ID with authorization check
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getClassById(classId) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }
    return cls;
  }

  /**
   * Get all classes for a course
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getClassesByCourse(courseId, page, limit) {
    // Verify course exists
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!courseExists) {
      throw new Error('Course not found');
    }

    const { classes, total } = await Promise.all([
      classesRepository.findClassesByCourse(courseId, page, limit),
      classesRepository.countClassesByCourse(courseId),
    ]);

    return {
      classes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Filter classes with advanced options
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async filterClasses(filters) {
    return classesRepository.findClassesWithFilter(filters);
  }

  /**
   * Update a class (Lecturer-only)
   */
  async updateClass(classId, data, lecturerId, isAdmin = false) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization: Only the course lecturer can update
    if (!isAdmin && cls.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can update this class');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.updateClass(classId, data);
  }

  /**
   * Delete a class (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async deleteClass(classId, lecturerId, isAdmin = false) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization: Only the course lecturer can delete
    if (!isAdmin && cls.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can delete this class');
      error.statusCode = 403;
      throw error;
    }

    // If class has active enrollments, prevent deletion
    const enrollmentCount = await classesRepository.countEnrollmentsByClass(classId);
    if (enrollmentCount > 0) {
      throw new Error('Cannot delete a class with active enrollments. Unenroll students first.');
    }

    return classesRepository.deleteClass(classId);
  }

  /**
   * Get class with all relations (for lecturer admin view)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getClassDetails(classId, userId) {
    const cls = await classesRepository.getClassWithFullRelations(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization: Only lecturer or admin can view full details
    if (cls.course.lecturerId !== userId) {
      throw new Error('You do not have permission to view this class');
    }

    return cls;
  }

  // ============================================
  // CLASS ENROLLMENT OPERATIONS
  // ============================================

  /**
   * Enroll a student in a class (Student or Lecturer)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async enrollStudentInClass(classId, userId) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Check if class is at capacity
    if (cls.capacity && cls.enrollmentCount >= cls.capacity) {
      throw new Error('Class is at full capacity');
    }

    return classesRepository.enrollStudent(classId, userId);
  }

  /**
   * Bulk enroll students in a class (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async bulkEnrollStudents(classId, userIds, userId) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization: Only the lecturer can bulk enroll
    if (cls.course.lecturerId !== userId) {
      throw new Error('Only the course lecturer can bulk enroll students');
    }

    return classesRepository.bulkEnrollStudents(classId, userIds);
  }

  /**
   * Get enrollment record
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getEnrollment(classId, userId) {
    const enrollment = await classesRepository.findEnrollment(classId, userId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    return enrollment;
  }

  /**
   * Get all enrollments for a class (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getEnrollmentsByClass(classId, userId, page, limit) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization
    if (cls.course.lecturerId !== userId) {
      throw new Error('Only the course lecturer can view enrollments');
    }

    const enrollments = await classesRepository.findEnrollmentsByClass(classId, page, limit);
    const total = await classesRepository.countEnrollmentsByClass(classId);

    return {
      enrollments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update enrollment status (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateEnrollmentStatus(enrollmentId, status, lecturerId, isAdmin = false) {
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { class: { include: { course: true } } },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Authorization
    if (!isAdmin && enrollment.class.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can update enrollment status');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.updateEnrollmentStatus(enrollmentId, status);
  }

  /**
   * Remove student from class (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async removeStudentFromClass(enrollmentId, userId) {
    const enrollment = await prisma.classEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { class: { include: { course: true } } },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Authorization
    if (enrollment.class.course.lecturerId !== userId) {
      throw new Error('Only the course lecturer can remove students');
    }

    await classesRepository.removeEnrollment(enrollmentId);
    await classesRepository.updateEnrollmentCount(enrollment.classId);
  }

  /**
   * Get all classes for a student (Student-specific)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getMyClasses(userId) {
    return classesRepository.findClassesForStudent(userId);
  }

  // ============================================
  // CLASS SESSION OPERATIONS
  // ============================================

  /**
   * Create a class session (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async createSession(classId, data, lecturerId, isAdmin = false) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Authorization
    if (!isAdmin && cls.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can create sessions');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.createSession({
      classId,
      ...data,
    });
  }

  /**
   * Get session by ID
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getSessionById(sessionId) {
    const session = await classesRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  /**
   * Get all sessions for a class
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getSessionsByClass(classId, page, limit) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    const sessions = await classesRepository.findSessionsByClass(classId, page, limit);
    const total = await classesRepository.countSessionsByClass(classId);

    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get upcoming sessions for a student/lecturer
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUpcomingSessions(classId) {
    return classesRepository.findUpcomingSessions(classId);
  }

  /**
   * Get past sessions (history)
   */
  async getPastSessions(classId, page, limit) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    const sessions = await classesRepository.findPastSessions(classId, limit);
    return sessions;
  }

  /**
   * Update a session (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateSession(sessionId, data, lecturerId, isAdmin = false) {
    const session = await classesRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get the class to check authorization
    const cls = await classesRepository.findClassById(session.classId);
    if (!isAdmin && cls.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can update sessions');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.updateSession(sessionId, data);
  }

  /**
   * Delete a session (Lecturer-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async deleteSession(sessionId, lecturerId, isAdmin = false) {
    const session = await classesRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const cls = await classesRepository.findClassById(session.classId);
    if (!isAdmin && cls.course.lecturerId !== lecturerId) {
      const error = new Error('Only the course lecturer can delete sessions');
      error.statusCode = 403;
      throw error;
    }

    return classesRepository.deleteSession(sessionId);
  }

  /**
   * Get sessions in a date range
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getSessionsByDateRange(classId, startDate, endDate) {
    const cls = await classesRepository.findClassById(classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    return classesRepository.findSessionsByDateRange(classId, startDate, endDate);
  }

  /**
   * Record attendance for a session
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async recordAttendance(sessionId, attendanceCount, userId) {
    const session = await classesRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Authorization
    const cls = await classesRepository.findClassById(session.classId);
    if (cls.course.lecturerId !== userId) {
      throw new Error('Only the course lecturer can record attendance');
    }

    return classesRepository.updateAttendanceCount(sessionId, attendanceCount);
  }
}

module.exports = new ClassesService();

