const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class GradeRepository extends BaseRepository {
  constructor() {
    super(prisma.grade);
  }

  /**
   * Find grades by user
   */
  async findByUser(userId, options = {}) {
    return this.findMany(
      { userId },
      { ...options, include: { gradingScheme: true, course: true } }
    );
  }

  /**
   * Find grades by course
   */
  async findByCourse(courseId, options = {}) {
    return this.findMany(
      { courseId },
      { ...options, include: { user: true } }
    );
  }

  /**
   * Get user grades for course
   */
  async getUserCourseGrades(userId, courseId) {
    return this.findMany({
      userId,
      courseId,
    });
  }

  /**
   * Calculate course GPA
   */
  async calculateCourseGPA(courseId) {
    const grades = await this.findByCourse(courseId);

    if (grades.length === 0) return 0;

    const totalPoints = grades.reduce(
      (sum, grade) => sum + (grade.score || 0),
      0
    );
    return Math.round((totalPoints / grades.length) * 100) / 100;
  }

  /**
   * Get class grades statistics
   */
  async getCourseGradesStats(courseId) {
    const grades = await this.findByCourse(courseId);

    const scores = grades.map((g) => g.score || 0);
    const total = scores.length;

    if (total === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0 };
    }

    const average = Math.round(
      (scores.reduce((a, b) => a + b, 0) / total) * 100
    ) / 100;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      total,
      average,
      highest,
      lowest,
    };
  }

  /**
   * Get top students in course
   */
  async getTopStudents(courseId, limit = 10) {
    const grades = await this.findByCourse(courseId, {
      limit,
      orderBy: { score: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return grades;
  }

  /**
   * Check if grade is passing
   */
  async isPassing(gradeId, passingScore = 60) {
    const grade = await this.model.findUnique({
      where: { id: gradeId },
    });

    return grade && grade.score >= passingScore;
  }

  /**
   * Get grading breakdown
   */
  async getGradingBreakdown(courseId) {
    const grades = await this.findByCourse(courseId);

    return {
      A: grades.filter((g) => g.score >= 90).length,
      B: grades.filter((g) => g.score >= 80 && g.score < 90).length,
      C: grades.filter((g) => g.score >= 70 && g.score < 80).length,
      D: grades.filter((g) => g.score >= 60 && g.score < 70).length,
      F: grades.filter((g) => g.score < 60).length,
    };
  }
}

module.exports = GradeRepository;
