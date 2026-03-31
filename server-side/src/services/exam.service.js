const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { examRepository, gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class ExamService {
  /**
   * Create a new exam
   */
  async createExam(data, lecturerId) {
    const { course_id, title, description, total_questions, passing_score, time_limit, start_date, end_date, shuffle_questions } = data;

    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) },
      include: { lecturer: true }
    });

    if (!course) {
      throw new ValidationException('Course not found');
    }

    if (course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can create exams');
    }

    const exam = await prisma.exam.create({
      data: {
        course_id: parseInt(course_id),
        title,
        description,
        total_questions: parseInt(total_questions),
        passing_score: parseInt(passing_score),
        time_limit: parseInt(time_limit),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        shuffle_questions: shuffle_questions === 'true' || shuffle_questions === true,
        status: 'draft'
      }
    });

    return exam;
  }

  /**
   * Start an exam attempt (create a new attempt)
   */
  async startExamAttempt(examId, studentId) {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { course: true }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        course_id: exam.course_id,
        student_id: studentId,
        status: 'active'
      }
    });

    if (!enrollment) {
      throw new ValidationException('Student is not enrolled in this course');
    }

    // Check remaining attempts
    const remainingAttempts = await examRepository.getRemainingAttempts(examId, studentId, exam.max_attempts || 3);
    if (remainingAttempts <= 0) {
      throw new ValidationException('No attempts remaining for this exam');
    }

    // Check if exam is within date range
    const now = new Date();
    if (now < new Date(exam.start_date) || now > new Date(exam.end_date)) {
      throw new ValidationException('Exam is not available at this time');
    }

    // Create attempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        exam_id: parseInt(examId),
        student_id: studentId,
        started_at: new Date(),
        status: 'in_progress'
      }
    });

    // Fetch questions (optionally shuffle)
    const questions = await prisma.question.findMany({
      where: { exam_id: parseInt(examId) },
      include: { options: true }
    });

    const shuffledQuestions = exam.shuffle_questions ? this.shuffleArray(questions) : questions;

    return {
      attempt_id: attempt.id,
      exam_id: exam.id,
      title: exam.title,
      time_limit: exam.time_limit,
      total_questions: exam.total_questions,
      questions: shuffledQuestions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options.map(o => ({
          id: o.id,
          option_text: o.option_text
        }))
      }))
    };
  }

  /**
   * Submit exam answers
   */
  async submitExamAnswers(attemptId, answers) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: { exam: true }
    });

    if (!attempt) {
      throw new ValidationException('Exam attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new ValidationException('This exam attempt is already submitted');
    }

    // Save each answer
    for (const answer of answers) {
      await prisma.examAnswer.create({
        data: {
          attempt_id: parseInt(attemptId),
          question_id: answer.question_id,
          selected_option_id: answer.selected_option_id || null,
          answer_text: answer.answer_text || null,
          is_correct: false // Will be calculated in grading
        }
      });
    }

    // Mark attempt as submitted
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: parseInt(attemptId) },
      data: {
        submitted_at: new Date(),
        status: 'submitted'
      }
    });

    return {
      message: 'Exam submitted successfully',
      attempt: updatedAttempt
    };
  }

  /**
   * Grade exam automatically
   */
  async gradeExam(attemptId) {
    const attempt = await examRepository.findWithAnswers(attemptId);

    if (!attempt) {
      throw new ValidationException('Exam attempt not found');
    }

    if (attempt.status !== 'submitted') {
      throw new ValidationException('Exam must be submitted before grading');
    }

    let correctAnswers = 0;

    // Check each answer
    for (const answer of attempt.answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.question_id },
        include: { options: true }
      });

      // Find correct option
      const correctOption = question.options.find(o => o.is_correct);

      if (answer.selected_option_id === correctOption.id) {
        correctAnswers++;
        await prisma.examAnswer.update({
          where: { id: answer.id },
          data: { is_correct: true }
        });
      }
    }

    // Calculate score
    const scorePercentage = (correctAnswers / attempt.exam.total_questions) * 100;
    const isPassed = scorePercentage >= attempt.exam.passing_score;

    // Update attempt with grade
    const gradedAttempt = await prisma.examAttempt.update({
      where: { id: parseInt(attemptId) },
      data: {
        status: 'graded',
        score: scorePercentage,
        passed: isPassed,
        graded_at: new Date()
      }
    });

    // Create or update grade record
    await gradeRepository.upsertGrade({
      student_id: attempt.student_id,
      exam_id: attempt.exam_id,
      score: scorePercentage,
      passed: isPassed
    });

    return {
      attempt_id: gradedAttempt.id,
      score: gradedAttempt.score,
      passed: gradedAttempt.passed,
      correct_answers: correctAnswers,
      total_questions: attempt.exam.total_questions
    };
  }

  /**
   * Get exam results for a student
   */
  async getExamResults(examId, studentId) {
    const results = await examRepository.getStudentResults(examId, studentId);
    return results;
  }

  /**
   * Get class statistics for an exam
   */
  async getExamStats(examId) {
    const stats = await examRepository.getStats(examId);
    return stats;
  }

  /**
   * Utility: Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Publish exam
   */
  async publishExam(examId, lecturerId) {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { course: true }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    if (exam.course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can publish exams');
    }

    const updated = await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: { status: 'published' }
    });

    return updated;
  }

  /**
   * Delete exam (soft delete)
   */
  async deleteExam(examId, lecturerId) {
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { course: true }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    if (exam.course.lecturer.user_id !== lecturerId) {
      throw new ValidationException('Only course lecturer can delete exams');
    }

    await prisma.exam.update({
      where: { id: parseInt(examId) },
      data: { deleted_at: new Date() }
    });

    return { message: 'Exam deleted successfully' };
  }
}

module.exports = new ExamService();
