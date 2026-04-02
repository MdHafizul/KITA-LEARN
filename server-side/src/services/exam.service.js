const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');
const { exam: examRepository, grade: gradeRepository } = require('../repositories');

const prisma = new PrismaClient();

class ExamService {
  /**
   * Create a new exam
   */
  async createExam(data, lecturerId) {
    const { activityId, title, description, totalQuestions, passingScore, timeLimit, startDate, endDate, shuffleQuestions } = data;

    const activity = await prisma.learningActivity.findUnique({
      where: { id: activityId },
      include: { course: { include: { lecturer: true } } }
    });

    if (!activity) {
      throw new ValidationException('Activity not found');
    }

    if (activity.course.lecturer.userId !== lecturerId) {
      throw new ValidationException('Only course lecturer can create exams');
    }

    const exam = await prisma.exam.create({
      data: {
        activityId,
        title,
        description,
        totalQuestions: parseInt(totalQuestions),
        passingScore: parseInt(passingScore),
        timeLimit: parseInt(timeLimit),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        shuffleQuestions: shuffleQuestions === 'true' || shuffleQuestions === true,
        status: 'DRAFT'
      }
    });

    return exam;
  }

  /**
   * Start an exam attempt (create a new attempt)
   */
  async startExamAttempt(examId, studentId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { activity: { include: { course: true } } }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: exam.activity.courseId,
        userId: studentId,
        status: 'active'
      }
    });

    if (!enrollment) {
      throw new ValidationException('Student is not enrolled in this course');
    }

    // Check remaining attempts
    const attemptCount = await prisma.examAttempt.count({
      where: { examId }
    });

    const maxAttempts = exam.totalAttempts || 3;
    if (attemptCount >= maxAttempts) {
      throw new ValidationException('No attempts remaining for this exam');
    }

    // Check if exam is within date range
    const now = new Date();
    if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
      throw new ValidationException('Exam is not available at this time');
    }

    // Create attempt record
    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        userId: studentId,
        startedAt: new Date(),
        status: 'IN_PROGRESS'
      }
    });

    // Fetch questions (optionally shuffle)
    const questions = await prisma.question.findMany({
      where: { examId },
      include: { options: true }
    });

    const shuffledQuestions = exam.shuffleQuestions ? this.shuffleArray(questions) : questions;

    return {
      attemptId: attempt.id,
      examId: exam.id,
      title: exam.title,
      timeLimit: exam.timeLimit,
      totalQuestions: exam.totalQuestions,
      questions: shuffledQuestions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options.map(o => ({
          id: o.id,
          optionText: o.optionText
        }))
      }))
    };
  }

  /**
   * Submit exam answers
   */
  async submitExamAnswers(attemptId, answers) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true }
    });

    if (!attempt) {
      throw new ValidationException('Exam attempt not found');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new ValidationException('This exam attempt is already submitted');
    }

    // Save each answer
    for (const answer of answers) {
      await prisma.examAnswer.create({
        data: {
          attemptId,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId || null,
          answerText: answer.answerText || null,
          isCorrect: false // Will be calculated in grading
        }
      });
    }

    // Mark attempt as submitted
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        status: 'SUBMITTED'
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

    if (attempt.status !== 'SUBMITTED') {
      throw new ValidationException('Exam must be submitted before grading');
    }

    let correctAnswers = 0;

    // Check each answer
    for (const answer of attempt.answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId },
        include: { options: true }
      });

      // Find correct option
      const correctOption = question.options.find(o => o.isCorrect);

      if (answer.selectedOptionId === correctOption.id) {
        correctAnswers++;
        await prisma.examAnswer.update({
          where: { id: answer.id },
          data: { isCorrect: true }
        });
      }
    }

    // Calculate score
    const scorePercentage = (correctAnswers / attempt.exam.totalQuestions) * 100;
    const isPassed = scorePercentage >= attempt.exam.passingScore;

    // Update attempt with grade
    const gradedAttempt = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'GRADED',
        score: scorePercentage,
        passed: isPassed,
        gradedAt: new Date()
      }
    });

    // Create or update grade record
    await gradeRepository.upsertGrade({
      userId: attempt.userId,
      examId: attempt.examId,
      score: scorePercentage,
      passed: isPassed
    });

    return {
      attemptId: gradedAttempt.id,
      score: gradedAttempt.score,
      passed: gradedAttempt.passed,
      correctAnswers: correctAnswers,
      totalQuestions: attempt.exam.totalQuestions
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
   * Get all exams for a course
   */
  async getAllExams(courseId, { page = 1, limit = 10 }, userId) {
    const skip = (page - 1) * limit;

    const exams = await prisma.exam.findMany({
      where: { activity: { courseId } },
      skip,
      take: limit,
      include: { activity: true },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.exam.count({
      where: { activity: { courseId } }
    });

    return {
      exams,
      page,
      limit,
      total
    };
  }

  /**
   * Get exam by ID with questions
   */
  async getExamById(examId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        activity: true,
        questions: {
          include: { options: true }
        }
      }
    });

    return exam;
  }

  /**
   * Start exam for student
   */
  async startExam(examId, userId) {
    const attempt = await this.startExamAttempt(examId, userId);
    const exam = await this.getExamById(examId);

    return {
      success: true,
      attempt,
      exam
    };
  }

  /**
   * Submit exam for student
   */
  async submitExam(examId, attemptId, answers, userId) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt || attempt.userId !== userId) {
      return {
        success: false,
        error: 'Invalid attempt',
        code: 'INVALID_ATTEMPT'
      };
    }

    await this.submitExamAnswers(attemptId, answers);
    const graded = await this.gradeExam(attemptId);

    return {
      success: true,
      attempt: graded,
      score: graded.score,
      passed: graded.passed
    };
  }

  /**
   * Get exam attempts for user
   */
  async getExamAttempts(examId, userId) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        examId,
        userId
      },
      orderBy: { startedAt: 'desc' }
    });

    return attempts;
  }

  /**
   * Get exam results
   */
  async getExamResults(examId, userId) {
    const results = await prisma.examAttempt.findMany({
      where: { examId, userId },
      include: { answers: true },
      orderBy: { gradedAt: 'desc' }
    });

    return results;
  }

  /**
   * Publish exam
   */
  async publishExam(examId, lecturerId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { activity: { include: { course: { include: { lecturer: true } } } } }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    if (exam.activity.course.lecturer.userId !== lecturerId) {
      throw new ValidationException('Only course lecturer can publish exams');
    }

    const updated = await prisma.exam.update({
      where: { id: examId },
      data: { status: 'PUBLISHED' }
    });

    return updated;
  }

  /**
   * Delete exam (soft delete)
   */
  async deleteExam(examId, lecturerId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { activity: { include: { course: { include: { lecturer: true } } } } }
    });

    if (!exam) {
      throw new ValidationException('Exam not found');
    }

    if (exam.activity.course.lecturer.userId !== lecturerId) {
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
