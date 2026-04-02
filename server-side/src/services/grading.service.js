const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { grade: gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class GradingService {
  /**
   * Get grades for a course (paginated)
   */
  async getCourseGrades(courseId, userId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const grades = await prisma.grade.findMany({
      where: { courseId },
      include: { user: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.grade.count({
      where: { courseId }
    });

    return {
      grades,
      page,
      limit,
      total
    };
  }

  /**
   * Calculate student GPA for a specific course
   */
  async calculateStudentGPA(studentId, courseId) {
    const grades = await prisma.grade.findMany({
      where: {
        userId: studentId,
        courseId
      }
    });

    if (grades.length === 0) {
      return 0;
    }

    const average = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
    return average;
  }

  /**
   * Get student grades for a specific course
   */
  async getStudentGrades(studentId, courseId, userId) {
    const grades = await prisma.grade.findMany({
      where: {
        userId: studentId,
        courseId
      },
      include: {
        exam: { select: { id: true, title: true } }
      }
    });

    return grades;
  }

  /**
   * Get grade statistics for a course
   */
  async getGradeStatistics(courseId, userId) {
    const grades = await prisma.grade.findMany({
      where: { courseId }
    });

    if (grades.length === 0) {
      return null;
    }

    const scores = grades.map(g => g.score);
    const average = scores.reduce((a, b) => a + b) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      courseId,
      totalStudents: grades.length,
      averageScore: Math.round(average),
      highestScore: highest,
      lowestScore: lowest
    };
  }

  /**
   * Export grades to CSV
   */
  async exportGradesToCSV(courseId, userId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'active' },
      include: { student: true }
    });

    if (enrollments.length === 0) {
      return null;
    }

    const grades = [];

    for (const enrollment of enrollments) {
      const gpa = await this.calculateStudentGPA(enrollment.userId, courseId);
      const letterGrade = this.getLetterGrade(gpa);

      grades.push({
        studentId: enrollment.userId,
        studentName: enrollment.student.fullName,
        email: enrollment.student.email,
        gpa: gpa.toFixed(2),
        letterGrade: letterGrade
      });
    }

    // Convert to CSV format
    const headers = ['Student ID', 'Student Name', 'Email', 'GPA', 'Letter Grade'];
    const rows = grades.map(g => [
      g.studentId,
      g.studentName,
      g.email,
      g.gpa,
      g.letterGrade
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get letter grade from percentage
   */
  getLetterGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Bulk calculate grades for a course
   */
  async calculateCourseGrades(courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: 'active' }
    });

    const results = [];

    for (const enrollment of enrollments) {
      const gpa = await this.calculateStudentGPA(enrollment.userId, courseId);
      const letterGrade = this.getLetterGrade(gpa);

      results.push({
        userId: enrollment.userId,
        gpa,
        letterGrade: letterGrade
      });
    }

    return results;
  }

  /**
   * Get student grade breakdown by assessment
   */
  async getStudentGradeBreakdown(courseId, studentId) {
    const breakdown = await prisma.grade.findMany({
      where: {
        userId: studentId,
        courseId
      },
      include: {
        exam: true
      }
    });

    return breakdown;
  }

  /**
   * Update grade (admin/lecturer)
   */
  async updateGrade(gradeId, score, comment, lecturerId) {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        course: { include: { lecturer: true } }
      }
    });

    if (!grade) {
      throw new ValidationException('Grade record not found');
    }

    if (grade.course.lecturerId !== lecturerId) {
      throw new ValidationException('Only course lecturer can update grades');
    }

    const updated = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        score: parseFloat(score),
        comment,
        updatedAt: new Date()
      }
    });

    return updated;
  }

  /**
   * Create a grading scheme
   */
  async createGradingScheme(data) {
    const { course_id, name, A_min, B_min, C_min, D_min, F_score } = data;

    const scheme = await prisma.gradingScheme.create({
      data: {
        course_id: parseInt(course_id),
        name,
        A_min: parseFloat(A_min),
        B_min: parseFloat(B_min),
        C_min: parseFloat(C_min),
        D_min: parseFloat(D_min),
        F_score: parseFloat(F_score)
      }
    });

    return scheme;
  }

  /**
   * Get top performers in a course
   */
  async getTopStudents(courseId, limit = 10) {
    const students = await gradeRepository.getTopStudents(parseInt(courseId), limit);
    return students;
  }
}

module.exports = new GradingService();
