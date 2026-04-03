/**
 * Grades Repository
 * Prisma data access layer for Grade and GradingRubric models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class GradesRepository {
    // ============================================
    // GRADE QUERIES
    // ============================================

    /**
     * Find grade by ID
     */
    async findGradeById(id) {
        return prisma.grade.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
    }

    /**
     * Find grade by user and course (unique)
     */
    async findGradeByUserAndCourse(userId, courseId) {
        return prisma.grade.findFirst({
            where: {
                userId,
                courseId,
                deletedAt: null
            },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
    }

    /**
     * Find grade by user and activity (unique)
     */
    async findGradeByUserAndActivity(userId, activityId) {
        return prisma.grade.findFirst({
            where: {
                userId,
                activityId,
                deletedAt: null
            },
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
    }

    /**
     * Get grades by user with pagination
     */
    async findGradesByUser(userId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.grade.findMany({
                where: { userId, deletedAt: null },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.grade.count({
                where: { userId, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get grades by course with pagination
     */
    async findGradesByCourse(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.grade.findMany({
                where: { courseId, deletedAt: null },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { percentage: 'desc' }
            }),
            prisma.grade.count({
                where: { courseId, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get grades by activity with pagination
     */
    async findGradesByActivity(activityId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.grade.findMany({
                where: { activityId, deletedAt: null },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { percentage: 'desc' }
            }),
            prisma.grade.count({
                where: { activityId, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get grades with filters and pagination
     */
    async findGradesWithFilters(filters, { page = 1, limit = 10 }) {
        const where = {
            deletedAt: null,
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.courseId && { courseId: filters.courseId }),
            ...(filters.activityId && { activityId: filters.activityId }),
            ...(filters.isPublished !== undefined && { isPublished: filters.isPublished }),
            ...(filters.gradeValue && { gradeValue: filters.gradeValue })
        };

        if (filters.minPercentage !== undefined || filters.maxPercentage !== undefined) {
            where.percentage = {
                ...(filters.minPercentage !== undefined && { gte: filters.minPercentage }),
                ...(filters.maxPercentage !== undefined && { lte: filters.maxPercentage })
            };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.grade.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.grade.count({ where })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Create grade
     */
    async createGrade(data) {
        return prisma.grade.create({
            data,
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
    }

    /**
     * Create multiple grades (bulk)
     */
    async createBulkGrades(data) {
        return prisma.grade.createMany({
            data,
            skipDuplicates: true
        });
    }

    /**
     * Update grade
     */
    async updateGrade(id, data) {
        return prisma.grade.update({
            where: { id },
            data,
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });
    }

    /**
     * Publish grade(s)
     */
    async publishGrades(ids, publishedAt = new Date()) {
        return prisma.grade.updateMany({
            where: { id: { in: ids } },
            data: {
                isPublished: true,
                publishedAt
            }
        });
    }

    /**
     * Unpublish grade(s)
     */
    async unpublishGrades(ids) {
        return prisma.grade.updateMany({
            where: { id: { in: ids } },
            data: {
                isPublished: false,
                publishedAt: null
            }
        });
    }

    /**
     * Soft delete grade
     */
    async deleteGrade(id) {
        return prisma.grade.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get grade statistics for course
     */
    async getCourseGradeStats(courseId) {
        const grades = await prisma.grade.findMany({
            where: { courseId, deletedAt: null },
            select: { percentage: true, gradeValue: true }
        });

        if (grades.length === 0) {
            return null;
        }

        const percentages = grades.map(g => g.percentage);
        const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;

        const gradeDistribution = {};
        grades.forEach(g => {
            gradeDistribution[g.gradeValue] = (gradeDistribution[g.gradeValue] || 0) + 1;
        });

        return {
            totalStudents: grades.length,
            avgPercentage: Math.round(avgPercentage * 100) / 100,
            minPercentage: Math.min(...percentages),
            maxPercentage: Math.max(...percentages),
            gradeDistribution
        };
    }

    /**
     * Get grade statistics for activity
     */
    async getActivityGradeStats(activityId) {
        const grades = await prisma.grade.findMany({
            where: { activityId, deletedAt: null },
            select: { percentage: true, gradeValue: true }
        });

        if (grades.length === 0) {
            return null;
        }

        const percentages = grades.map(g => g.percentage);
        const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;

        const gradeDistribution = {};
        grades.forEach(g => {
            gradeDistribution[g.gradeValue] = (gradeDistribution[g.gradeValue] || 0) + 1;
        });

        return {
            totalSubmissions: grades.length,
            avgPercentage: Math.round(avgPercentage * 100) / 100,
            minPercentage: Math.min(...percentages),
            maxPercentage: Math.max(...percentages),
            gradeDistribution
        };
    }

    /**
     * Get unpublished grades (for review)
     */
    async getUnpublishedGrades(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.grade.findMany({
                where: { courseId, isPublished: false, deletedAt: null },
                include: {
                    user: {
                        select: { id: true, fullName: true, email: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' }
            }),
            prisma.grade.count({
                where: { courseId, isPublished: false, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    // ============================================
    // GRADING RUBRIC QUERIES
    // ============================================

    /**
     * Find rubric by ID
     */
    async findRubricById(id) {
        return prisma.gradingRubric.findUnique({
            where: { id }
        });
    }

    /**
     * Get all rubrics with pagination
     */
    async findAllRubrics({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.gradingRubric.findMany({
                where: { deletedAt: null },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.gradingRubric.count({
                where: { deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Create rubric
     */
    async createRubric(data) {
        return prisma.gradingRubric.create({ data });
    }

    /**
     * Update rubric
     */
    async updateRubric(id, data) {
        return prisma.gradingRubric.update({
            where: { id },
            data
        });
    }

    /**
     * Soft delete rubric
     */
    async deleteRubric(id) {
        return prisma.gradingRubric.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}

module.exports = new GradesRepository();
