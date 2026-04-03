/**
 * Classes Repository
 * Data access layer for Class, ClassEnrollment, and ClassSession entities
 * Handles all Prisma queries with soft delete support
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClassesRepository {
  // ============================================
  // CLASS OPERATIONS
  // ============================================

  /**
   * Create a new class
   */
  async createClass(data) {
    return prisma.class.create({
      data,
      include: {
        course: true,
      },
    });
  }

  /**
   * Create multiple classes in bulk
   */
  async createBulkClasses(courseId, classes) {
    return prisma.class.createMany({
      data: classes.map((cls) => ({
        ...cls,
        courseId,
      })),
    });
  }

  /**
   * Find class by ID (excluding soft deleted)
   */
  async findClassById(classId) {
    return prisma.class.findFirst({
      where: {
        id: classId,
        deletedAt: null,
      },
      include: {
        course: true,
        enrollments: {
          where: { id: { not: undefined } }, // Filter for current enrollments if needed
        },
        sessions: {
          orderBy: { sessionDate: 'desc' },
          take: 10, // Recent sessions only
        },
      },
    });
  }

  /**
   * Find all classes for a specific course
   */
  async findClassesByCourse(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.class.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
      include: {
        enrollments: {
          select: { id: true, userId: true, status: true },
        },
        sessions: {
          select: { id: true, sessionDate: true, topic: true },
          orderBy: { sessionDate: 'desc' },
          take: 3, // Latest 3 sessions
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  /**
   * Count total classes for a course
   */
  async countClassesByCourse(courseId) {
    return prisma.class.count({
      where: {
        courseId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find classes with filtering
   */
  async findClassesWithFilter(filters) {
    const { courseId, name, location, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(courseId && { courseId }),
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
    };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          course: { select: { id: true, title: true } },
          enrollments: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.class.count({ where }),
    ]);

    return { classes, total, page, limit };
  }

  /**
   * Update a class
   */
  async updateClass(classId, data) {
    return prisma.class.update({
      where: { id: classId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        course: true,
      },
    });
  }

  /**
   * Soft delete a class
   */
  async deleteClass(classId) {
    return prisma.class.update({
      where: { id: classId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get class with full relations (for admin view)
   */
  async getClassWithFullRelations(classId) {
    return prisma.class.findFirst({
      where: {
        id: classId,
        deletedAt: null,
      },
      include: {
        course: {
          select: { id: true, title: true, lecturerId: true },
        },
        enrollments: {
          include: { class: false },
        },
        sessions: {
          orderBy: { sessionDate: 'desc' },
        },
      },
    });
  }

  /**
   * Update enrollment count for a class
   */
  async updateEnrollmentCount(classId) {
    const count = await prisma.classEnrollment.count({
      where: { classId },
    });

    return prisma.class.update({
      where: { id: classId },
      data: { enrollmentCount: count },
    });
  }

  // ============================================
  // CLASS ENROLLMENT OPERATIONS
  // ============================================

  /**
   * Enroll a student in a class
   */
  async enrollStudent(classId, userId) {
    // Check if already enrolled
    const existing = await prisma.classEnrollment.findUnique({
      where: {
        classId_userId: { classId, userId },
      },
    });

    if (existing) {
      throw new Error('Student is already enrolled in this class');
    }

    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId,
        userId,
        status: 'ACTIVE',
      },
    });

    // Update enrollment count
    await this.updateEnrollmentCount(classId);

    return enrollment;
  }

  /**
   * Bulk enroll multiple students in a class
   */
  async bulkEnrollStudents(classId, userIds) {
    const enrollments = await prisma.classEnrollment.createMany({
      data: userIds.map((userId) => ({
        classId,
        userId,
        status: 'ACTIVE',
      })),
      skipDuplicates: true,
    });

    // Update enrollment count
    await this.updateEnrollmentCount(classId);

    return enrollments;
  }

  /**
   * Find enrollment record
   */
  async findEnrollment(classId, userId) {
    return prisma.classEnrollment.findUnique({
      where: {
        classId_userId: { classId, userId },
      },
    });
  }

  /**
   * Find all enrollments for a class
   */
  async findEnrollmentsByClass(classId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return prisma.classEnrollment.findMany({
      where: { classId },
      select: {
        id: true,
        userId: true,
        enrolledAt: true,
        status: true,
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit,
    });
  }

  /**
   * Count enrollments in a class
   */
  async countEnrollmentsByClass(classId) {
    return prisma.classEnrollment.count({
      where: { classId },
    });
  }

  /**
   * Update enrollment status
   */
  async updateEnrollmentStatus(enrollmentId, status) {
    return prisma.classEnrollment.update({
      where: { id: enrollmentId },
      data: { status },
    });
  }

  /**
   * Remove a student from a class
   */
  async removeEnrollment(enrollmentId) {
    return prisma.classEnrollment.delete({
      where: { id: enrollmentId },
    });
  }

  /**
   * Find all classes for a student
   */
  async findClassesForStudent(userId) {
    return prisma.classEnrollment.findMany({
      where: { userId },
      include: {
        class: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  // ============================================
  // CLASS SESSION OPERATIONS
  // ============================================

  /**
   * Create a class session
   */
  async createSession(data) {
    return prisma.classSession.create({
      data,
    });
  }

  /**
   * Find session by ID
   */
  async findSessionById(sessionId) {
    return prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          select: { id: true, courseId: true, name: true },
        },
      },
    });
  }

  /**
   * Find all sessions for a class
   */
  async findSessionsByClass(classId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return prisma.classSession.findMany({
      where: { classId },
      orderBy: { sessionDate: 'desc' },
      skip,
      take: limit,
    });
  }

  /**
   * Count sessions for a class
   */
  async countSessionsByClass(classId) {
    return prisma.classSession.count({
      where: { classId },
    });
  }

  /**
   * Find upcoming sessions for a class
   */
  async findUpcomingSessions(classId, limit = 5) {
    const now = new Date();
    return prisma.classSession.findMany({
      where: {
        classId,
        sessionDate: { gte: now },
      },
      orderBy: { sessionDate: 'asc' },
      take: limit,
    });
  }

  /**
   * Find past sessions for a class (for history)
   */
  async findPastSessions(classId, limit = 10) {
    const now = new Date();
    return prisma.classSession.findMany({
      where: {
        classId,
        sessionDate: { lt: now },
      },
      orderBy: { sessionDate: 'desc' },
      take: limit,
    });
  }

  /**
   * Update a session
   */
  async updateSession(sessionId, data) {
    return prisma.classSession.update({
      where: { id: sessionId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId) {
    return prisma.classSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Find sessions in a date range
   */
  async findSessionsByDateRange(classId, startDate, endDate) {
    return prisma.classSession.findMany({
      where: {
        classId,
        sessionDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { sessionDate: 'asc' },
    });
  }

  /**
   * Update attendance count for a session
   */
  async updateAttendanceCount(sessionId, count) {
    return prisma.classSession.update({
      where: { id: sessionId },
      data: { attendanceCount: count },
    });
  }
}

module.exports = new ClassesRepository();
