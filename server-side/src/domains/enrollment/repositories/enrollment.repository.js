/**
 * Enrollment Repository
 * Prisma data access layer for Enrollment model
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class EnrollmentRepository {
    /**
     * Find enrollment by ID
     */
    async findById(id) {
        return prisma.enrollment.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        status: true,
                        creditHours: true,
                        enrollmentCount: true
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
     * Find enrollment by course and user (unique constraint)
     */
    async findByCourseAndUser(courseId, userId) {
        return prisma.enrollment.findUnique({
            where: {
                courseId_userId: { courseId, userId }
            },
            include: {
                course: true,
                user: true
            }
        });
    }

    /**
     * Get enrollments by course with pagination
     */
    async findByCourse(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseId,
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
            orderBy: { enrollmentDate: 'desc' }
        });

        const total = await prisma.enrollment.count({
            where: {
                courseId,
                deletedAt: null
            }
        });

        return { enrollments, total, page, limit };
    }

    /**
     * Get enrollments by user with pagination
     */
    async findByUser(userId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                deletedAt: null
            },
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        status: true,
                        creditHours: true
                    }
                }
            },
            orderBy: { enrollmentDate: 'desc' }
        });

        const total = await prisma.enrollment.count({
            where: {
                userId,
                deletedAt: null
            }
        });

        return { enrollments, total, page, limit };
    }

    /**
     * Get enrollments with filters and pagination
     */
    async findWithFilters({ courseId, userId, status }, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            ...(courseId && { courseId }),
            ...(userId && { userId }),
            ...(status && { status })
        };

        const enrollments = await prisma.enrollment.findMany({
            where,
            skip,
            take: limit,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        status: true
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
            orderBy: { enrollmentDate: 'desc' }
        });

        const total = await prisma.enrollment.count({ where });

        return { enrollments, total, page, limit };
    }

    /**
     * Create enrollment
     */
    async create(data) {
        return prisma.enrollment.create({
            data,
            include: {
                course: true,
                user: true
            }
        });
    }

    /**
     * Bulk create enrollments
     */
    async createBulk(courseId, userIds) {
        const enrollments = await Promise.all(
            userIds.map(userId =>
                prisma.enrollment.create({
                    data: { courseId, userId },
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true }
                        }
                    }
                }).catch(error => {
                    // Handle unique constraint violation (already enrolled)
                    if (error.code === 'P2002') {
                        return null; // Skip duplicate enrollments
                    }
                    throw error;
                })
            )
        );

        return enrollments.filter(e => e !== null);
    }

    /**
     * Update enrollment
     */
    async update(id, data) {
        return prisma.enrollment.update({
            where: { id },
            data,
            include: {
                course: true,
                user: true
            }
        });
    }

    /**
     * Update enrollment status
     */
    async updateStatus(id, status) {
        const completionDate = status === 'COMPLETED' ? new Date() : null;

        return prisma.enrollment.update({
            where: { id },
            data: {
                status,
                ...(completionDate && { completionDate })
            },
            include: {
                course: true,
                user: true
            }
        });
    }

    /**
     * Update progress
     */
    async updateProgress(id, progressPercent) {
        return prisma.enrollment.update({
            where: { id },
            data: { progressPercent }
        });
    }

    /**
     * Soft delete enrollment
     */
    async delete(id) {
        return prisma.enrollment.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get course statistics (enrollment count by status)
     */
    async getCourseStat(courseId) {
        const stats = await prisma.enrollment.groupBy({
            by: ['status'],
            where: {
                courseId,
                deletedAt: null
            },
            _count: {
                id: true
            }
        });

        return stats.reduce((acc, stat) => {
            acc[stat.status.toLowerCase()] = stat._count.id;
            return acc;
        }, {});
    }

    /**
     * Get user enrollment count
     */
    async getUserEnrollmentCount(userId) {
        return prisma.enrollment.count({
            where: {
                userId,
                status: 'ACTIVE',
                deletedAt: null
            }
        });
    }

    /**
     * Check if user is enrolled in course
     */
    async isEnrolled(courseId, userId) {
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                courseId_userId: { courseId, userId }
            }
        });

        return enrollment && !enrollment.deletedAt;
    }
}

module.exports = new EnrollmentRepository();
