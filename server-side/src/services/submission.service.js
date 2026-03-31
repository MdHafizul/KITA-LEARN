const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { submissionRepository, gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class SubmissionService {
  /**
   * Submit an assignment
   */
  async submitAssignment(assignmentId, studentId, submission_text, file_path = null) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
      include: { course: true }
    });

    if (!assignment) {
      throw new ValidationException('Assignment not found');
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        course_id: assignment.course_id,
        student_id: studentId,
        status: 'active'
      }
    });

    if (!enrollment) {
      throw new ValidationException('Student is not enrolled in this course');
    }

    // Check deadline
    const now = new Date();
    if (now > new Date(assignment.due_date)) {
      throw new ValidationException('Assignment deadline has passed');
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignment_id: parseInt(assignmentId),
        student_id: studentId
      }
    });

    if (existingSubmission && existingSubmission.status === 'submitted') {
      throw new ValidationException('Assignment already submitted');
    }

    const submission = await prisma.submission.create({
      data: {
        assignment_id: parseInt(assignmentId),
        student_id: studentId,
        submission_text,
        file_path,
        submitted_at: new Date(),
        status: 'submitted'
      }
    });

    return {
      id: submission.id,
      assignment_id: submission.assignment_id,
      submitted_at: submission.submitted_at,
      message: 'Assignment submitted successfully'
    };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId, score, feedback, lecturerId) {
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(submissionId) },
      include: {
        assignment: {
          include: { course: { include: { lecturer: true } } }
        }
      }
    });

    if (!submission) {
      throw new ValidationException('Submission not found');
    }

    if (submission.assignment.course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can grade submissions');
    }

    const graded = await prisma.submission.update({
      where: { id: parseInt(submissionId) },
      data: {
        score: parseFloat(score),
        feedback,
        graded_at: new Date(),
        status: 'graded'
      }
    });

    // Create grade record
    await gradeRepository.upsertGrade({
      student_id: submission.student_id,
      assignment_id: submission.assignment_id,
      score: parseFloat(score),
      passed: parseFloat(score) >= (submission.assignment.passing_score || 60)
    });

    return graded;
  }

  /**
   * Get submission details
   */
  async getSubmission(submissionId) {
    const submission = await submissionRepository.findById(submissionId);
    return submission;
  }

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId, page = 1, limit = 20) {
    const submissions = await submissionRepository.findByAssignment(assignmentId, page, limit);
    return submissions;
  }

  /**
   * Get submissions by student
   */
  async getStudentSubmissions(studentId, page = 1, limit = 20) {
    const submissions = await submissionRepository.findByStudent(studentId, page, limit);
    return submissions;
  }

  /**
   * Get submission status
   */
  async getSubmissionStatus(assignmentId, studentId) {
    const submission = await prisma.submission.findFirst({
      where: {
        assignment_id: parseInt(assignmentId),
        student_id: studentId
      }
    });

    if (!submission) {
      return { status: 'not_submitted' };
    }

    return {
      status: submission.status,
      submitted_at: submission.submitted_at,
      score: submission.score,
      feedback: submission.feedback,
      graded_at: submission.graded_at
    };
  }

  /**
   * Delete submission (soft delete)
   */
  async deleteSubmission(submissionId, lecturerId) {
    const submission = await prisma.submission.findUnique({
      where: { id: parseInt(submissionId) },
      include: {
        assignment: {
          include: { course: { include: { lecturer: true } } }
        }
      }
    });

    if (!submission) {
      throw new ValidationException('Submission not found');
    }

    if (submission.assignment.course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can delete submissions');
    }

    await prisma.submission.update({
      where: { id: parseInt(submissionId) },
      data: { deleted_at: new Date() }
    });

    return { message: 'Submission deleted successfully' };
  }
}

module.exports = new SubmissionService();
