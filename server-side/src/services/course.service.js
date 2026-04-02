const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { course: courseRepository } = require('../repositories');

const prisma = new PrismaClient();

class CourseService {
  /**
   * Resolve lecturer profile ID from authenticated user
   */
  async resolveLecturerProfileId(userId, userRole = 'USER') {
    let lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId }
    });

    // Admins can create courses too. Create a minimal lecturer profile if missing.
    if (!lecturerProfile && userRole === 'ADMIN') {
      lecturerProfile = await prisma.lecturerProfile.create({
        data: { userId }
      });
    }

    if (!lecturerProfile) {
      throw new ValidationException('Lecturer profile not found for this account');
    }

    return lecturerProfile.id;
  }

  /**
   * Validate course ownership based on User ID (not LecturerProfile ID)
   */
  async assertCourseAccess(courseId, userId, userRole = 'USER', forbiddenMessage = 'Access denied') {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: {
          select: { userId: true }
        }
      }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (userRole === 'ADMIN') {
      return course;
    }

    if (!course.lecturer || course.lecturer.userId !== userId) {
      throw new ValidationException(forbiddenMessage);
    }

    return course;
  }

  /**
   * Create a new course
   * @param {Object} data - Course data
   * @param {string} userId - User ID (creator)
   * @param {string} userRole - Already normalized role from auth middleware (LECTURER or ADMIN)
   */
  async createCourse(data, userId, userRole = 'USER') {
    const { title, description, creditHours, maxStudents, difficultyLevel, startDate, endDate } = data;

    // Only check role - it's already verified by auth middleware
    if (userRole !== 'LECTURER' && userRole !== 'ADMIN') {
      throw new ValidationException(`Only lecturers and admins can create courses`);
    }

    const lecturerProfileId = await this.resolveLecturerProfileId(userId, userRole);

    const course = await prisma.course.create({
      data: {
        title,
        description,
        creditHours: parseInt(creditHours),
        maxStudents: parseInt(maxStudents),
        difficultyLevel,
        lecturerId: lecturerProfileId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'DRAFT'
      },
      include: { lecturer: true }
    });

    // Log audit
    await this.logAudit(userId, 'CREATE_COURSE', `Created course: ${title}`, 'Course', course.id);

    return course;
  }

  /**
   * Update course details
   */
  async updateCourse(courseId, data, userId, userRole = 'USER') {
    const { title, description, creditHours, maxStudents, difficultyLevel, startDate, endDate } = data;

    const course = await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can update');

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || course.title,
        description: description || course.description,
        creditHours: creditHours ? parseInt(creditHours) : course.creditHours,
        maxStudents: maxStudents ? parseInt(maxStudents) : course.maxStudents,
        difficultyLevel: difficultyLevel || course.difficultyLevel,
        startDate: startDate ? new Date(startDate) : course.startDate,
        endDate: endDate ? new Date(endDate) : course.endDate,
        updatedAt: new Date()
      }
    });

    await this.logAudit(userId, 'UPDATE_COURSE', `Updated course: ${course.title}`, 'Course', courseId);

    return updated;
  }

  /**
   * Publish a course (make it available for enrollment)
   */
  async publishCourse(courseId, userId, userRole = 'USER') {
    const course = await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can publish');

    if (course.status === 'PUBLISHED') {
      throw new ValidationException('Course is already published');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        updatedAt: new Date()
      }
    });

    await this.logAudit(userId, 'PUBLISH_COURSE', `Published course: ${course.title}`, 'Course', courseId);

    return updated;
  }

  /**
   * Archive a course
   */
  async archiveCourse(courseId, userId, userRole = 'USER') {
    const course = await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can archive');

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    });

    await this.logAudit(userId, 'ARCHIVE_COURSE', `Archived course: ${course.title}`, 'Course', courseId);

    return updated;
  }

  /**
   * Get course with full content
   */
  async getCourseWithContent(courseId) {
    const course = await courseRepository.findWithContent(courseId);

    if (!course) {
      throw new ValidationException('Course not found');
    }

    return course;
  }

  /**
   * Get course statistics
   */
  async getCourseStats(courseId) {
    const stats = await courseRepository.getStats(courseId);
    return stats;
  }

  /**
   * Search courses
   */
  async searchCourses(query, page = 1, limit = 10) {
    const courses = await courseRepository.search(query, page, limit);
    return courses;
  }

  /**
   * Get published courses
   */
  async getPublishedCourses(page = 1, limit = 10) {
    const courses = await courseRepository.findPublished(page, limit);
    return courses;
  }

  /**
   * Get all courses with filters
   */
  async getAllCourses({ page = 1, limit = 10, search, status }, userId) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      skip,
      take: limit,
      include: { lecturer: true },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.course.count({ where });

    return {
      courses,
      page,
      limit,
      total
    };
  }

  /**
   * Get course by ID with full details
   */
  async getCourseById(courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: true,
        materials: true,
        prerequisites: true
      }
    });

    return course;
  }

  /**
   * Get course students (enrolled)
   */
  async getCourseStudents(courseId, userId, { page = 1, limit = 20 }, userRole = 'USER') {
    await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can view students');

    const skip = (page - 1) * limit;

    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'active'
      },
      include: { student: true },
      skip,
      take: limit
    });

    const total = await prisma.enrollment.count({
      where: { courseId, status: 'active' }
    });

    return {
      students: enrollments.map(e => ({
        id: e.student.id,
        name: e.student.fullName,
        email: e.student.email,
        enrolledAt: e.enrollmentDate
      })),
      page,
      limit,
      total
    };
  }

  /**
   * Add course prerequisites
   */
  async addPrerequisite(courseId, prerequisiteId, userId, userRole = 'USER') {
    const course = await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can add prerequisites');

    const prerequisite = await prisma.course.findUnique({
      where: { id: prerequisiteId }
    });

    if (!prerequisite) {
      throw new ValidationException('Prerequisite course not found');
    }

    await prisma.coursePrerequisite.create({
      data: {
        courseId: courseId,
        prerequisiteCourseId: prerequisiteId
      }
    });

    await this.logAudit(userId, 'ADD_PREREQUISITE', `Added prerequisite to course: ${course.title}`, 'Course', courseId);

    return { message: 'Prerequisite added successfully' };
  }

  /**
   * Log audit trail
   */
  async logAudit(userId, action, description, entity, entityId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        changes: JSON.stringify({ description }),
        entity,
        entityId,
        ipAddress: '0.0.0.0', // Would be from request context
        userAgent: 'api'
      }
    });
  }

  /**
   * Delete course (soft delete)
   */
  async deleteCourse(courseId, userId, userRole = 'USER') {
    const course = await this.assertCourseAccess(courseId, userId, userRole, 'Only course creator can delete');

    await prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() }
    });

    await this.logAudit(userId, 'delete_course', `Deleted course: ${course.title}`, 'course', courseId);

    return { message: 'Course deleted successfully' };
  }
}

module.exports = new CourseService();
