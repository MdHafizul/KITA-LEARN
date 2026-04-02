const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { submission: submissionRepository, grade: gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class SubmissionService {
  /**
   * Submit an assignment
   */
  async submitAssignment(activityId, studentId, { content, attachmentUrl }) {
    const activity = await prisma.learningActivity.findUnique({
      where: { id: activityId },
      include: { course: true }
    });

    if (!activity) {
      return {
        success: false,
        error: 'Activity not found',
        code: 'ACTIVITY_NOT_FOUND'
      };
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: activity.courseId,
        userId: studentId,
        status: 'active'
      }
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Student is not enrolled in this course',
        code: 'NOT_ENROLLED'
      };
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        activityId,
        userId: studentId
      }
    });

    if (existingSubmission && existingSubmission.status === 'SUBMITTED') {
      return {
        success: false,
        error: 'Assignment already submitted',
        code: 'ALREADY_SUBMITTED'
      };
    }

    const submission = await prisma.submission.create({
      data: {
        activityId,
        userId: studentId,
        submissionContent: content,
        attachmentUrl,
        submittedAt: new Date(),
        status: 'SUBMITTED'
      }
    });

    return {
      success: true,
      submission: {
        id: submission.id,
        activityId: submission.activityId,
        submittedAt: submission.submittedAt
      }
    };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId, lecturerId, { score, feedback }) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        activity: {
          include: { course: { include: { lecturer: true } } }
        }
      }
    });

    if (!submission) {
      return {
        success: false,
        error: 'Submission not found',
        code: 'NOT_FOUND'
      };
    }

    if (submission.activity.course.lecturerId !== lecturerId) {
      return {
        success: false,
        error: 'Only course lecturer can grade submissions',
        code: 'FORBIDDEN'
      };
    }

    const graded = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(score),
        feedback,
        gradeTime: new Date(),
        status: 'GRADED'
      }
    });

    // Create grade record
    await prisma.grade.upsert({
      where: {
        userId_courseId: {
          userId: submission.userId,
          courseId: submission.activity.courseId
        }
      },
      update: {
        score: parseFloat(score)
      },
      create: {
        userId: submission.userId,
        courseId: submission.activity.courseId,
        score: parseFloat(score)
      }
    });

    return {
      success: true,
      submission: graded
    };
  }

  /**
   * Get submission details
   */
  async getSubmission(submissionId) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { activity: true }
    });

    return submission;
  }

  /**
   * Get all submissions for an activity
   */
  async getAllSubmissions(activityId, { page = 1, limit = 20 }, lecturerId) {
    const activity = await prisma.learningActivity.findUnique({
      where: { id: activityId },
      include: { course: true }
    });

    if (!activity || activity.course.lecturerId !== lecturerId) {
      throw new ValidationException('Access denied');
    }

    const skip = (page - 1) * limit;

    const submissions = await prisma.submission.findMany({
      where: { activityId },
      include: { student: true },
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' }
    });

    const total = await prisma.submission.count({
      where: { activityId }
    });

    return {
      submissions,
      page,
      limit,
      total
    };
  }

  /**
   * Get user's submissions
   */
  async getUserSubmissions(userId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: { activity: true },
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' }
    });

    const total = await prisma.submission.count({
      where: { userId }
    });

    return {
      submissions,
      page,
      limit,
      total
    };
  }

  /**
   * Get assignment submissions
   */
  async getAssignmentSubmissions(assignmentId, { page = 1, limit = 20 }, lecturerId) {
    const skip = (page - 1) * limit;

    const submissions = await prisma.submission.findMany({
      where: { activityId: assignmentId },
      include: { student: true },
      skip,
      take: limit
    });

    const total = await prisma.submission.count({
      where: { activityId: assignmentId }
    });

    return {
      submissions,
      page,
      limit,
      total
    };
  }

  /**
   * Get submission status
   */
  async getSubmissionStatus(activityId, studentId) {
    const submission = await prisma.submission.findFirst({
      where: {
        activityId,
        userId: studentId
      }
    });

    if (!submission) {
      return { status: 'NOT_SUBMITTED' };
    }

    return {
      status: submission.status,
      submittedAt: submission.submittedAt,
      score: submission.score,
      feedback: submission.feedback,
      gradedAt: submission.gradeTime
    };
  }

  /**
   * Delete submission
   */
  async deleteSubmission(submissionId, lecturerId) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        activity: {
          include: { course: { include: { lecturer: true } } }
        }
      }
    });

    if (!submission) {
      throw new ValidationException('Submission not found');
    }

    if (submission.activity.course.lecturerId !== lecturerId) {
      throw new ValidationException('Only course lecturer can delete submissions');
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'DELETED' }
    });

    return { message: 'Submission deleted successfully' };
  }
}

module.exports = new SubmissionService();
