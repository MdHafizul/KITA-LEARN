const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class GradingService {
  /**
   * Calculate course GPA for a student
   */
  async calculateCourseGPA(courseId, studentId) {
    const gpa = await gradeRepository.calculateCourseGPA(courseId, studentId);
    return gpa;
  }

  /**
   * Get course grade statistics
   */
  async getCourseGradeStats(courseId) {
    const stats = await gradeRepository.getCourseGradesStats(courseId);
    return stats;
  }

  /**
   * Get top performers in a course
   */
  async getTopStudents(courseId, limit = 10) {
    const students = await gradeRepository.getTopStudents(courseId, limit);
    return students;
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
   * Get letter grade from percentage
   */
  getLetterGrade(percentage, scheme = null) {
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
      where: { course_id: parseInt(courseId), status: 'active' }
    });

    const results = [];

    for (const enrollment of enrollments) {
      const gpa = await this.calculateCourseGPA(courseId, enrollment.student_id);
      const letterGrade = this.getLetterGrade(gpa);

      results.push({
        student_id: enrollment.student_id,
        gpa,
        letter_grade: letterGrade
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
        student_id: studentId,
        course_id: parseInt(courseId)
      },
      include: {
        exam: true,
        assignment: true
      }
    });

    return breakdown;
  }

  /**
   * Update grade (admin/lecturer)
   */
  async updateGrade(gradeId, score, comment, lecturerId) {
    const grade = await prisma.grade.findUnique({
      where: { id: parseInt(gradeId) },
      include: {
        course: { include: { lecturer: true } }
      }
    });

    if (!grade) {
      throw new ValidationException('Grade record not found');
    }

    if (grade.course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can update grades');
    }

    const updated = await prisma.grade.update({
      where: { id: parseInt(gradeId) },
      data: {
        score: parseFloat(score),
        comment,
        updated_at: new Date()
      }
    });

    return updated;
  }

  /**
   * Export course grades to CSV
   */
  async exportCourseGrades(courseId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { course_id: parseInt(courseId), status: 'active' },
      include: { student: true }
    });

    const grades = [];

    for (const enrollment of enrollments) {
      const gpa = await this.calculateCourseGPA(courseId, enrollment.student_id);
      const letterGrade = this.getLetterGrade(gpa);

      grades.push({
        student_id: enrollment.student_id,
        student_name: enrollment.student.full_name,
        email: enrollment.student.email,
        gpa: gpa.toFixed(2),
        letter_grade: letterGrade
      });
    }

    return grades;
  }
}

module.exports = new GradingService();
