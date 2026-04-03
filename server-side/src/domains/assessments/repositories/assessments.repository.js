/**
 * Assessments Repository
 * Prisma data access layer for Exam, ExamQuestion, ExamAttempt, ExamAnswer, AttemptOptionSnapshot, GradingScheme models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AssessmentsRepository {

    /**
     * Find all Exams with pagination
     * @param {Object} options - Pagination options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.limit - Items per page (default: 10)
     * @returns {Object} - Paginated list of exams with metadata
     */
    async getAllExams({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;
        const exams = await prisma.exam.findMany({
            where: { deletedAt: null },
            skip,
            take: limit
        });
        const total = await prisma.exam.count({ where: { deletedAt: null } });
        return { exams, total, page, limit };
    }

    /**
     * Find exam by ID
     */
    async findExamById(id) {
        return prisma.exam.findUnique({
            where: { id },
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                        course: { select: { lecturerId: true } }
                    }
                },
                questions: {
                    orderBy: { displayOrder: 'asc' }
                },
                attempts: true
            }
        });
    }

    /**
     * Find exams by activity
     */
    async findByActivity(activityId) {
        return prisma.exam.findMany({
            where: { activityId, deletedAt: null },
            include: {
                activity: { select: { id: true, title: true } },
                questions: true,
                attempts: true
            }
        });
    }

    /**
     * Create exam
     */
    async createExam(data) {
        return prisma.exam.create({
            data,
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Update exam
     */
    async updateExam(id, data) {
        return prisma.exam.update({
            where: { id },
            data,
            include: {
                activity: { select: { id: true, title: true } },
                questions: true
            }
        });
    }

    /**
     * Soft delete exam
     */
    async deleteExam(id) {
        return prisma.exam.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create exam question
     */
    async createQuestion(data) {
        return prisma.examQuestion.create({
            data,
            include: {
                exam: { select: { id: true, totalQuestions: true } }
            }
        });
    }

    /**
     * Get exam questions
     */
    async getQuestions(examId) {
        return prisma.examQuestion.findMany({
            where: { examId },
            orderBy: { displayOrder: 'asc' },
            include: {
                exam: { select: { id: true } }
            }
        });
    }

    /**
     * Get single question
     */
    async getQuestion(id) {
        return prisma.examQuestion.findUnique({
            where: { id },
            include: {
                exam: { select: { id: true, totalQuestions: true } }
            }
        });
    }

    /**
     * Update question
     */
    async updateQuestion(id, data) {
        return prisma.examQuestion.update({
            where: { id },
            data,
            include: {
                exam: { select: { id: true } }
            }
        });
    }

    /**
     * Delete question
     */
    async deleteQuestion(id) {
        return prisma.examQuestion.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create exam attempt
     */
    async createAttempt(data) {
        return prisma.examAttempt.create({
            data,
            include: {
                exam: { select: { id: true, totalQuestions: true, passingScore: true } }
            }
        });
    }

    /**
     * Get exam attempt
     */
    async getAttempt(id) {
        return prisma.examAttempt.findUnique({
            where: { id },
            include: {
                exam: { select: { id: true, totalQuestions: true, passingScore: true } },
                answers: {
                    include: {
                        question: {
                            select: { id: true, questionText: true, type: true }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get user attempts for exam
     */
    async getUserAttempts(examId, userId) {
        return prisma.examAttempt.findMany({
            where: { examId, userId },
            include: {
                exam: { select: { id: true, totalQuestions: true } },
                answers: true
            },
            orderBy: { startedAt: 'desc' }
        });
    }

    /**
     * Update attempt (submit/grade)
     */
    async updateAttempt(id, data) {
        return prisma.examAttempt.update({
            where: { id },
            data,
            include: {
                exam: { select: { id: true, passingScore: true } },
                answers: {
                    include: {
                        question: { select: { id: true } }
                    }
                }
            }
        });
    }

    /**
     * Create exam answer
     */
    async createAnswer(data) {
        return prisma.examAnswer.create({
            data,
            include: {
                attempt: { select: { id: true } },
                question: { select: { id: true, correctOption: true } }
            }
        });
    }

    /**
     * Get attempt answers
     */
    async getAnswers(attemptId) {
        return prisma.examAnswer.findMany({
            where: { attemptId },
            include: {
                question: {
                    select: { id: true, questionText: true, points: true }
                }
            }
        });
    }

    /**
     * Create option snapshot
     */
    async createOptionSnapshot(data) {
        return prisma.attemptOptionSnapshot.create({
            data
        });
    }

    /**
     * Get option snapshots for attempt
     */
    async getOptionSnapshots(attemptId) {
        return prisma.attemptOptionSnapshot.findMany({
            where: { attemptId },
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * Create grading scheme
     */
    async createGradingScheme(data) {
        return prisma.gradingScheme.create({
            data
        });
    }

    /**
     * Get grading schemes
     */
    async getGradingSchemes() {
        return prisma.gradingScheme.findMany({
            where: { deletedAt: null },
            orderBy: { gradeMinimum: 'asc' }
        });
    }

    /**
     * Get single grading scheme
     */
    async getGradingScheme(id) {
        return prisma.gradingScheme.findUnique({
            where: { id }
        });
    }

    /**
     * Update grading scheme
     */
    async updateGradingScheme(id, data) {
        return prisma.gradingScheme.update({
            where: { id },
            data
        });
    }

    /**
     * Delete grading scheme
     */
    async deleteGradingScheme(id) {
        return prisma.gradingScheme.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get exam statistics
     */
    async getExamStats(examId) {
        const exam = await prisma.exam.findUnique({
            where: { id: examId }
        });

        if (!exam) return null;

        const totalAttempts = await prisma.examAttempt.count({
            where: { examId }
        });

        const passedAttempts = await prisma.examAttempt.count({
            where: { examId, isPassed: true }
        });

        const averageScore = await prisma.examAttempt.aggregate({
            where: { examId, score: { not: null } },
            _avg: { score: true }
        });

        return {
            examId,
            totalAttempts,
            passedAttempts,
            failedAttempts: totalAttempts - passedAttempts,
            passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
            averageScore: averageScore._avg.score || 0,
            lastUpdated: exam.updatedAt
        };
    }
}

module.exports = new AssessmentsRepository();
