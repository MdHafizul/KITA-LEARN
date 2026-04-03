/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

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
     * Get all exams 
     */
    /**
     * @desc: Service function executes domain business logic and repository orchestration.
     * @param {Object} options - Pagination options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.limit - Items per page (default: 10) 
     * @body N/A at service layer; consume already validated payload objects.
     * @returns {Object} - Paginated list of exams with total count
     */


    async getAllExams({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;
        const exams = await assessmentsRepository.getAllExams({ skip, limit });

        return { exams, page, limit };
    }


    /**
     * Get exam by ID
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async createExam(data, userId, isAdmin = false) {
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId }
        });

        if (!lecturerProfile && !isAdmin) {
            throw new ValidationException('Lecturer profile not found');
        }

        const lecturerId = lecturerProfile?.id;

        const activity = await prisma.learningActivity.findUnique({
            where: { id: data.activityId },
            include: { course: { include: { lecturer: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (!isAdmin && activity.course.lecturer.id !== lecturerId) {
            const error = new Error('Not authorized to create exam for this activity');
            error.statusCode = 403;
            throw error;
        }

        const examData = {
            title: data.title,
            description: data.description || null,
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateExam(id, data, lecturerId, isAdmin = false) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (!isAdmin && exam.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to update this exam');
            error.statusCode = 403;
            throw error;
        }

        return assessmentsRepository.updateExam(id, data);
    }

    /**
     * Delete exam (soft delete)
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteExam(id, lecturerId, isAdmin = false) {
        const exam = await assessmentsRepository.findExamById(id);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (!isAdmin && exam.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to delete this exam');
            error.statusCode = 403;
            throw error;
        }

        return assessmentsRepository.deleteExam(id);
    }

    /**
     * Create exam question
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async createQuestion(examId, data, lecturerId, isAdmin = false) {
        const exam = await assessmentsRepository.findExamById(examId);

        if (!exam) {
            throw new ValidationException('Exam not found');
        }

        if (!isAdmin && exam.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to add questions to this exam');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateQuestion(id, data, lecturerId, isAdmin = false) {
        const question = await assessmentsRepository.getQuestion(id);

        if (!question) {
            throw new ValidationException('Question not found');
        }

        const exam = await assessmentsRepository.findExamById(question.exam.id);
        if (!isAdmin && exam.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to update this question');
            error.statusCode = 403;
            throw error;
        }

        return assessmentsRepository.updateQuestion(id, data);
    }

    /**
     * Delete question
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteQuestion(id, lecturerId, isAdmin = false) {
        const question = await assessmentsRepository.getQuestion(id);

        if (!question) {
            throw new ValidationException('Question not found');
        }

        const exam = await assessmentsRepository.findExamById(question.exam.id);
        if (!isAdmin && exam.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to delete this question');
            error.statusCode = 403;
            throw error;
        }

        return assessmentsRepository.deleteQuestion(id);
    }

    /**
     * Start exam attempt
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async createGradingScheme(data, lecturerId, isAdmin = false) {
        // Admin bypass: If admin, skip ownership check
        // Verify lecturer is authorized
        if (!isAdmin && !lecturerId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateGradingScheme(id, data, lecturerId, isAdmin = false) {
        const scheme = await assessmentsRepository.getGradingScheme(id);

        if (!scheme) {
            throw new ValidationException('Grading scheme not found');
        }

        // Add additional authorization checks if needed
        if (!isAdmin && !lecturerId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        return assessmentsRepository.updateGradingScheme(id, data);
    }

    /**
     * Delete grading scheme
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteGradingScheme(id, lecturerId, isAdmin = false) {
        const scheme = await assessmentsRepository.getGradingScheme(id);

        if (!scheme) {
            throw new ValidationException('Grading scheme not found');
        }

        // Add additional authorization checks if needed
        if (!isAdmin && !lecturerId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        return assessmentsRepository.deleteGradingScheme(id);
    }

    /**
     * Get exam statistics
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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

