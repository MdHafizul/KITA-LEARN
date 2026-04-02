/**
 * Submissions Repository
 * Prisma data access layer for Submission model
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SubmissionsRepository {
    /**
     * Find submission by ID
     */
    async findById(id) {
        return prisma.submission.findUnique({
            where: { id },
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        activityType: true,
                        courseId: true,
                        durationMinutes: true,
                        points: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImageUrl: true
                    }
                }
            }
        });
    }

    /**
     * Find submission by activity and user (unique constraint)
     */
    async findByActivityAndUser(activityId, userId) {
        return prisma.submission.findUnique({
            where: {
                activityId_userId: { activityId, userId }
            },
            include: {
                activity: true,
                user: true
            }
        });
    }

    /**
     * Get submissions by activity with pagination
     */
    async findByActivity(activityId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const submissions = await prisma.submission.findMany({
            where: {
                activityId,
                deletedAt: null
            },
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profileImageUrl: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        const total = await prisma.submission.count({
            where: {
                activityId,
                deletedAt: null
            }
        });

        return { submissions, total, page, limit };
    }

    /**
     * Get submissions by user with pagination
     */
    async findByUser(userId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                deletedAt: null
            },
            skip,
            take: limit,
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        activityType: true,
                        courseId: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        const total = await prisma.submission.count({
            where: {
                userId,
                deletedAt: null
            }
        });

        return { submissions, total, page, limit };
    }

    /**
     * Get submissions with filters and pagination
     */
    async findWithFilters({ activityId, userId, status, isLate }, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            ...(activityId && { activityId }),
            ...(userId && { userId }),
            ...(status && { status }),
            ...(isLate !== undefined && { isLate })
        };

        const submissions = await prisma.submission.findMany({
            where,
            skip,
            take: limit,
            include: {
                activity: {
                    select: {
                        id: true,
                        title: true,
                        activityType: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        const total = await prisma.submission.count({ where });

        return { submissions, total, page, limit };
    }

    /**
     * Create submission
     */
    async create(data) {
        return prisma.submission.create({
            data,
            include: {
                activity: true,
                user: true
            }
        });
    }

    /**
     * Update submission
     */
    async update(id, data) {
        return prisma.submission.update({
            where: { id },
            data,
            include: {
                activity: true,
                user: true
            }
        });
    }

    /**
     * Update submission status
     */
    async updateStatus(id, status) {
        return prisma.submission.update({
            where: { id },
            data: { status }
        });
    }

    /**
     * Grade submission
     */
    async grade(id, score, feedback) {
        return prisma.submission.update({
            where: { id },
            data: {
                status: 'GRADED',
                score,
                feedback,
                gradeTime: new Date()
            },
            include: {
                activity: true,
                user: true
            }
        });
    }

    /**
     * Submit assignment (mark as submitted)
     */
    async submit(id) {
        return prisma.submission.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date()
            },
            include: {
                activity: true,
                user: true
            }
        });
    }

    /**
     * Return submission for revision
     */
    async returnForRevision(id, feedback) {
        return prisma.submission.update({
            where: { id },
            data: {
                status: 'RETURNED',
                feedback
            }
        });
    }

    /**
     * Soft delete submission
     */
    async delete(id) {
        return prisma.submission.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get activity submission statistics
     */
    async getActivityStats(activityId) {
        const stats = await prisma.submission.groupBy({
            by: ['status'],
            where: {
                activityId,
                deletedAt: null
            },
            _count: {
                id: true
            },
            _avg: {
                score: true
            }
        });

        return stats.reduce((acc, stat) => {
            acc[stat.status.toLowerCase()] = {
                count: stat._count.id,
                avgScore: stat._avg.score
            };
            return acc;
        }, {});
    }

    /**
     * Get user submission statistics
     */
    async getUserStats(userId) {
        const total = await prisma.submission.count({
            where: { userId, deletedAt: null }
        });

        const graded = await prisma.submission.count({
            where: { userId, status: 'GRADED', deletedAt: null }
        });

        const submitted = await prisma.submission.count({
            where: { userId, status: 'SUBMITTED', deletedAt: null }
        });

        const draft = await prisma.submission.count({
            where: { userId, status: 'DRAFT', deletedAt: null }
        });

        const avgScore = await prisma.submission.aggregate({
            where: { userId, status: 'GRADED', deletedAt: null },
            _avg: { score: true }
        });

        return {
            total,
            graded,
            submitted,
            draft,
            avgScore: avgScore._avg.score
        };
    }

    /**
     * Get late submissions for activity
     */
    async getLateSubmissions(activityId) {
        return prisma.submission.findMany({
            where: {
                activityId,
                isLate: true,
                deletedAt: null
            },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });
    }

    /**
     * Check if user has submitted to activity
     */
    async hasSubmitted(activityId, userId) {
        const submission = await prisma.submission.findUnique({
            where: {
                activityId_userId: { activityId, userId }
            }
        });

        return submission && !submission.deletedAt;
    }

    /**
     * Get ungraded submissions for activity
     */
    async getUngradedSubmissions(activityId) {
        return prisma.submission.findMany({
            where: {
                activityId,
                status: { in: ['SUBMITTED', 'RETURNED'] },
                deletedAt: null
            },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            },
            orderBy: { submittedAt: 'asc' }
        });
    }
}

module.exports = new SubmissionsRepository();
