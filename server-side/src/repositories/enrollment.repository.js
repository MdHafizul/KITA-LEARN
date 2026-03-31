const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(prisma.enrollment);
  }

  /**
   * Find enrollments by user
   */
  async findByUser(userId, options = {}) {
    return this.findMany(
      { userId, enrolledAt: { not: null } },
      options
    );
  }

  /**
   * Find active enrollments for user
   */
  async findActive(userId, options = {}) {
    return this.findMany(
      {
        userId,
        status: 'ACTIVE',
        enrolledAt: { not: null },
      },
      options
    );
  }

  /**
   * Find enrollments by course
   */
  async findByCourse(courseId, options = {}) {
    return this.findMany(
      { courseId },
      { ...options, include: { user: true } }
    );
  }

  /**
   * Get enrollment progress
   */
  async getProgress(enrollmentId) {
    const enrollment = await this.model.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            activities: true,
          },
        },
        progression: {
          include: {
            completedActivities: true,
          },
        },
      },
    });

    if (!enrollment) return null;

    const totalActivities = enrollment.course.activities.length;
    const completedActivities =
      enrollment.progression?.completedActivities.length || 0;
    const progressPercentage =
      totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0;

    return {
      enrollmentId,
      totalActivities,
      completedActivities,
      progressPercentage,
      status: enrollment.status,
    };
  }

  /**
   * Check if user is enrolled
   */
  async isEnrolled(userId, courseId) {
    return this.model.findFirst({
      where: { userId, courseId },
    });
  }

  /**
   * Get course enrollments with progress
   */
  async getCourseEnrollmentsProgress(courseId) {
    const enrollments = await this.model.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        progression: {
          include: { completedActivities: true },
        },
        course: {
          select: { activities: { select: { id: true } } },
        },
      },
    });

    return enrollments.map((enrollment) => {
      const totalActivities = enrollment.course.activities.length;
      const completedActivities =
        enrollment.progression?.completedActivities.length || 0;

      return {
        ...enrollment,
        progress: {
          completed: completedActivities,
          total: totalActivities,
          percentage:
            totalActivities > 0
              ? Math.round((completedActivities / totalActivities) * 100)
              : 0,
        },
      };
    });
  }

  /**
   * Get enrollments grouped by status
   */
  async groupByStatus(courseId) {
    const enrollments = await this.findMany({ courseId });

    return {
      ACTIVE: enrollments.filter((e) => e.status === 'ACTIVE').length,
      COMPLETED: enrollments.filter((e) => e.status === 'COMPLETED').length,
      DROPPED: enrollments.filter((e) => e.status === 'DROPPED').length,
      SUSPENDED: enrollments.filter((e) => e.status === 'SUSPENDED').length,
    };
  }
}

module.exports = EnrollmentRepository;
