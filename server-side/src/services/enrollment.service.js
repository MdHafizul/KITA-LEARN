const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { enrollmentRepository } = require('../repositories');

const prisma = new PrismaClient();

class EnrollmentService {
  /**
   * Enroll student in a course
   */
  async enrollStudent(courseId, studentId) {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: {
        course_id: parseInt(courseId),
        student_id: studentId
      }
    });

    if (existing) {
      throw new ValidationException('Student is already enrolled in this course');
    }

    // Check course capacity
    const enrollmentCount = await prisma.enrollment.count({
      where: { course_id: parseInt(courseId), status: 'active' }
    });

    if (enrollmentCount >= course.max_students) {
      throw new ValidationException('Course has reached maximum capacity');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        course_id: parseInt(courseId),
        student_id: studentId,
        enrolled_at: new Date(),
        status: 'active'
      }
    });

    return enrollment;
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(studentId, page = 1, limit = 20) {
    const enrollments = await enrollmentRepository.getStudentEnrollments(studentId, page, limit);
    return enrollments;
  }

  /**
   * Get course enrollments
   */
  async getCourseEnrollments(courseId, page = 1, limit = 50) {
    const enrollments = await enrollmentRepository.getCourseEnrollments(courseId, page, limit);
    return enrollments;
  }

  /**
   * Get student progress in course
   */
  async getStudentProgress(courseId, studentId) {
    const progress = await enrollmentRepository.getStudentProgress(courseId, studentId);
    return progress;
  }

  /**
   * Mark enrollment as completed
   */
  async completeEnrollment(courseId, studentId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        course_id: parseInt(courseId),
        student_id: studentId
      }
    });

    if (!enrollment) {
      throw new ValidationException('Enrollment not found');
    }

    const completed = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'completed',
        completed_at: new Date()
      }
    });

    return completed;
  }

  /**
   * Unenroll student from course
   */
  async unenrollStudent(courseId, studentId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        course_id: parseInt(courseId),
        student_id: studentId
      }
    });

    if (!enrollment) {
      throw new ValidationException('Enrollment not found');
    }

    const unenrolled = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'withdrawn', unenrolled_at: new Date() }
    });

    return unenrolled;
  }

  /**
   * Get enrollment details
   */
  async getEnrollmentDetails(enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        course: true,
        student: true
      }
    });

    if (!enrollment) {
      throw new ValidationException('Enrollment not found');
    }

    return enrollment;
  }

  /**
   * Get class roster
   */
  async getClassRoster(courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course_id: parseInt(courseId),
        status: 'active'
      },
      include: { student: true }
    });

    return enrollments.map(e => ({
      student_id: e.student_id,
      student_name: e.student.full_name,
      email: e.student.email,
      phone: e.student.phone_number,
      enrolled_at: e.enrolled_at
    }));
  }
}

module.exports = new EnrollmentService();
