const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ExamRepository extends BaseRepository {
  constructor() {
    super(prisma.exam);
  }

  /**
   * Find exam with all questions
   */
  async findWithQuestions(examId) {
    return this.model.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        attempts: {
          include: {
            answers: true,
          },
        },
      },
    });
  }

  /**
   * Get exam attempts by user
   */
  async getAttempts(examId, userId, options = {}) {
    return prisma.examAttempt.findMany({
      where: { examId, userId },
      include: {
        answers: true,
        exam: true,
      },
      orderBy: { attemptedAt: 'desc' },
    });
  }

  /**
   * Get exam with grading scheme
   */
  async findWithGrading(examId) {
    return this.model.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true },
        },
        gradingScheme: true,
      },
    });
  }

  /**
   * Get active exams in course
   */
  async findActive(courseId, options = {}) {
    const now = new Date();
    return this.findMany(
      {
        courseId,
        startDate: { lte: now },
        endDate: { gte: now },
        deletedAt: null,
      },
      options
    );
  }

  /**
   * Get exam results for students
   */
  async getResults(examId) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId, submittedAt: { not: null } },
      include: {
        user: true,
        answers: true,
      },
    });

    return attempts.map((attempt) => ({
      userId: attempt.userId,
      userName: attempt.user.name,
      score: attempt.score,
      submittedAt: attempt.submittedAt,
      duration: attempt.endedAt
        ? (attempt.endedAt - attempt.startedAt) / 1000
        : null,
    }));
  }

  /**
   * Check if user has active attempt
   */
  async hasActiveAttempt(examId, userId) {
    return prisma.examAttempt.findFirst({
      where: {
        examId,
        userId,
        submittedAt: null,
      },
    });
  }

  /**
   * Get remaining attempts
   */
  async getRemainingAttempts(examId, userId, maxAttempts) {
    const completed = await prisma.examAttempt.count({
      where: {
        examId,
        userId,
        submittedAt: { not: null },
      },
    });

    return Math.max(0, maxAttempts - completed);
  }
}

module.exports = ExamRepository;
