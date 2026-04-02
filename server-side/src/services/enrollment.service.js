const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { enrollment: enrollmentRepository } = require('../repositories');

const prisma = new PrismaClient();

class EnrollmentService {
  /**
   * Enroll student in a course
   */
  async enrollStudent(courseId, studentId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return {
        success: false,
        error: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      };
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: {
        courseId,
        userId: studentId
      }
    });

    if (existing) {
      return {
        success: false,
        error: 'Student is already enrolled in this course',
        code: 'ALREADY_ENROLLED'
      };
    }

    // Check course capacity
    const enrollmentCount = await prisma.enrollment.count({
      where: { courseId, status: 'active' }
    });

    if (enrollmentCount >= course.maxStudents) {
      return {
        success: false,
        error: 'Course has reached maximum capacity',
        code: 'CAPACITY_FULL'
      };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        userId: studentId,
        enrollmentDate: new Date(),
        status: 'active'
      }
    });

    return {
      success: true,
      enrollment
    };
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(studentId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: { course: true },
      skip,
      take: limit,
      orderBy: { enrollmentDate: 'desc' }
    });

    const total = await prisma.enrollment.count({
      where: { userId: studentId }
    });

    return {
      enrollments,
      page,
      limit,
      total
    };
  }

  /**
   * Get course enrollments (Lecturer view)
   */
  async getCourseEnrollments(courseId, lecturerId, { page = 1, limit = 50 }) {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.lecturerId !== lecturerId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    const skip = (page - 1) * limit;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'active' },
      include: { student: true },
      skip,
      take: limit
    });

    const total = await prisma.enrollment.count({
      where: { courseId, status: 'active' }
    });

    return {
      success: true,
      enrollments,
      page,
      limit,
      total
    };
  }

  /**
   * Get enrollment progress
   */
  async getEnrollmentProgress(enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true }
    });

    if (!enrollment) {
      return null;
    }

    // Calculate progress based on completed activities
    const activities = await prisma.learningActivity.findMany({
      where: { courseId: enrollment.courseId }
    });

    const completedActivities = await prisma.activityProgress.count({
      where: {
        userId: enrollment.userId,
        enrollmentId,
        status: 'COMPLETED'
      }
    });

    const progress = activities.length > 0 ? (completedActivities / activities.length) * 100 : 0;

    return {
      enrollmentId,
      courseId: enrollment.courseId,
      courseName: enrollment.course.title,
      totalActivities: activities.length,
      completedActivities,
      progressPercentage: Math.round(progress),
      status: enrollment.status,
      enrolledAt: enrollment.enrollmentDate
    };
  }

  /**
   * Unenroll student from course
   */
  async unenrollStudent(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }

    // Only the student or admin can unenroll
    if (enrollment.userId !== userId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    const unenrolled = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'withdrawn',
        completionDate: new Date()
      }
    });

    return {
      success: true,
      data: unenrolled
    };
  }

  /**
   * Complete enrollment (mark as completed)
   */
  async completeEnrollment(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }

    // Only lecturer of the course or admin can mark complete
    const course = await prisma.course.findUnique({
      where: { id: enrollment.courseId }
    });

    if (course.lecturerId !== userId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'completed',
        completionDate: new Date()
      }
    });

    return {
      success: true,
      data: updated
    };
  }
}

module.exports = new EnrollmentService();
