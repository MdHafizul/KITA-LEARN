const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SubmissionRepository extends BaseRepository {
  constructor() {
    super(prisma.submission);
  }

  /**
   * Find submissions by assignment
   */
  async findByAssignment(assignmentId, options = {}) {
    return this.findMany(
      { assignmentId },
      { ...options, include: { user: true, assignment: true } }
    );
  }

  /**
   * Find submissions by user
   */
  async findByUser(userId, options = {}) {
    return this.findMany(
      { userId },
      { ...options, include: { assignment: true } }
    );
  }

  /**
   * Get pending submissions for grading
   */
  async getPending(options = {}) {
    return this.findMany(
      { grade: null, gradedAt: null },
      { ...options, include: { user: true, assignment: true } }
    );
  }

  /**
   * Get submissions by status
   */
  async findByStatus(status, options = {}) {
    return this.findMany(
      { status },
      { ...options, include: { user: true, assignment: true } }
    );
  }

  /**
   * Check if user submitted assignment
   */
  async hasSubmitted(assignmentId, userId) {
    return this.model.findFirst({
      where: { assignmentId, userId },
    });
  }

  /**
   * Get assignment submission stats
   */
  async getAssignmentStats(assignmentId) {
    const submissions = await this.findMany({ assignmentId });

    const total = submissions.length;
    const submitted = submissions.filter((s) => s.submittedAt).length;
    const graded = submissions.filter((s) => s.gradedAt).length;
    const pending = total - graded;

    const grades = submissions
      .filter((s) => s.grade !== null)
      .map((s) => s.grade);
    const avgGrade =
      grades.length > 0
        ? grades.reduce((a, b) => a + b, 0) / grades.length
        : 0;

    return {
      total,
      submitted,
      graded,
      pending,
      averageGrade: Math.round(avgGrade * 100) / 100,
    };
  }

  /**
   * Get user submission history
   */
  async getUserHistory(userId) {
    return this.model.findMany({
      where: { userId },
      include: {
        assignment: {
          select: { id: true, title: true, dueDate: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Check late submission
   */
  async isLate(submissionId) {
    const submission = await this.model.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission || !submission.submittedAt) return false;

    return submission.submittedAt > submission.assignment.dueDate;
  }
}

module.exports = SubmissionRepository;
