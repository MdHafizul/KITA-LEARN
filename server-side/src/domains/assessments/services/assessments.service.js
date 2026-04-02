/**
 * Assessments Service
 * Business logic for exam operations
 */

const { ValidationException } = require('../../../exceptions');
const assessmentsRepository = require('../repositories/assessments.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AssessmentsService {
    /**
     * Get exam by ID
     */
    async getExamById(id) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        return exam;
    }

    /**
     * Create exam
     */
    async createExam(data, lecturerId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: data.activityId },
            include: { course: { include: { lecturer: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturer.id !== lecturerId) {
            throw new ValidationException('Not authorized to create exam for this activity');
        }

        const examData = {
            activityId: data.activityId,
            totalQuestions: parseInt(data.totalQuestions),
            passingScore: parseInt(data.passingScore) || 50,
            timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
            shuffleQuestions: data.shuffleQuestions === true || data.shuffleQuestions === 'true'
        };

        return assessmentsRepository.createExam(examData);
    }

    /**
     * Update exam
     */
    async updateExam(id, data, lecturerId) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (exam.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this exam');
        }

        return assessmentsRepository.updateExam(id, data);
    }

    /**
     * Delete exam (soft delete)
     */
    async deleteExam(id, lecturerId) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (exam.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this exam');
        }

        return assessmentsRepository.deleteExam(id);
    }

    /**
     * Create exam question
     */
    async createQuestion(examId, data, lecturerId) {
        const exam = await assessmentsRepository.findExamById(examId);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (exam.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to add questions to this exam');
        }

        return assessmentsRepository.createQuestion({
            examId,
            questionText: data.question,
            displayOrder: data.questionOrder,
            type: data.questionType,
            options: data.options || null,
            points: data.points || 1,
            difficulty: data.difficulty || 'medium',
            explanation: data.explanation || null
        });
    }

    /**
     * Get exam questions
     */
    async getQuestions(examId) {
        const exam = await assessmentsRepository.findExamById(examId);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        return assessmentsRepository.getQuestions(examId);
    }

    /**
     * Update question
     */
    async updateQuestion(id, data, lecturerId) {
        const question = await assessmentsRepository.getQuestion(id);

        if (!question) {
            throw new ValidationException('Question not found');
        }

        const exam = await assessmentsRepository.findExamById(question.exam.id);
        if (exam.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this question');
        }

        return assessmentsRepository.updateQuestion(id, data);
    }

    /**
     * Delete question
     */
    async deleteQuestion(id, lecturerId) {
        const question = await assessmentsRepository.getQuestion(id);

        if (!question) {
            throw new ValidationException('Question not found');
        }

        const exam = await assessmentsRepository.findExamById(question.exam.id);
        if (exam.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this question');
        }

        return assessmentsRepository.deleteQuestion(id);
    }

    /**
     * Start exam attempt
     */
    async startAttempt(examId, userId) {
        const exam = await assessmentsRepository.findExamById(examId);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        // Check if user is enrolled
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                courseId: exam.activity.courseId,
                userId,
                deletedAt: null
            }
        });

        if (!enrollment) {
            throw new ValidationException('User not enrolled in this course');
        }

        const attempt = await assessmentsRepository.createAttempt({
            examId,
            userId,
            startedAt: new Date()
        });

        return attempt;
    }

    /**
     * Submit exam attempt
     */
    async submitAttempt(attemptId, answers, userId) {
        const attempt = await assessmentsRepository.getAttempt(attemptId);

        if (!attempt) {
            throw new ValidationException('Attempt not found');
        }

        if (attempt.userId !== userId) {
            throw new ValidationException('Not authorized to submit this attempt');
        }

        if (attempt.submittedAt) {
            throw new ValidationException('Attempt already submitted');
        }

        // Create answers
        for (const answer of answers) {
            await assessmentsRepository.createAnswer({
                attemptId,
                questionId: answer.questionId,
                userAnswer: answer.userAnswer
            });
        }

        // Grade attempt
        const graded = await this.gradeAttempt(attemptId);

        return graded;
    }

    /**
     * Grade attempt (calculates score and pass status)
     */
    async gradeAttempt(attemptId) {
        const attempt = await assessmentsRepository.getAttempt(attemptId);

        if (!attempt) {
            throw new ValidationException('Attempt not found');
        }

        // Calculate score
        let totalPoints = 0;
        let earnedPoints = 0;

        for (const answer of attempt.answers) {
            const points = answer.question.points || 1;
            totalPoints += points;
            // Note: Grading logic will depend on your grading scheme
            // For now, assuming manual grading or points calculation
            if (answer.pointsEarned) {
                earnedPoints += answer.pointsEarned;
            }
        }

        const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        const isPassed = percentage >= attempt.exam.passingScore;

        // Update attempt with score and status
        const updated = await assessmentsRepository.updateAttempt(attemptId, {
            submittedAt: new Date(),
            percentage: Math.round(percentage),
            isPassed,
            totalTimeSpent: new Date() - attempt.startedAt
        });

        return updated;
    }

    /**
     * Get user attempts for exam
     */
    async getUserAttempts(examId, userId) {
        const exam = await assessmentsRepository.findExamById(examId);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        return assessmentsRepository.getUserAttempts(examId, userId);
    }

    /**
     * Get attempt results
     */
    async getAttemptResults(attemptId, userId) {
        const attempt = await assessmentsRepository.getAttempt(attemptId);

        if (!attempt) {
            throw new ValidationException('Attempt not found');
        }

        if (attempt.userId !== userId) {
            throw new ValidationException('Not authorized to view this attempt');
        }

        return attempt;
    }

    /**
     * Create grading scheme
     */
    async createGradingScheme(data, lecturerId) {
        // Verify lecturer is authorized (you may need additional validation)
        return assessmentsRepository.createGradingScheme(data);
    }

    /**
     * Get grading schemes
     */
    async getGradingSchemes() {
        return assessmentsRepository.getGradingSchemes();
    }

    /**
     * Update grading scheme
     */
    async updateGradingScheme(id, data, lecturerId) {
        const scheme = await assessmentsRepository.getGradingScheme(id);

        if (!scheme) {
            throw new ValidationException('Grading scheme not found');
        }

        // Add additional authorization checks if needed
        return assessmentsRepository.updateGradingScheme(id, data);
    }

    /**
     * Delete grading scheme
     */
    async deleteGradingScheme(id, lecturerId) {
        const scheme = await assessmentsRepository.getGradingScheme(id);

        if (!scheme) {
            throw new ValidationException('Grading scheme not found');
        }

        // Add additional authorization checks if needed
        return assessmentsRepository.deleteGradingScheme(id);
    }

    /**
     * Get exam statistics
     */
    async getExamStats(id) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        return assessmentsRepository.getExamStats(id);
    }
}

module.exports = new AssessmentsService();
