/**
 * Activities Repository
 * Prisma data access layer for LearningActivity, ActivityPrerequisite, ContentActivity, Assignment models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ActivitiesRepository {
    /**
     * Find activity by ID
     */
    async findActivityById(id) {
        return prisma.learningActivity.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        lecturerId: true
                    }
                },
                prerequisites: true,
                contentActivity: true,
                assignment: true
            }
        });
    }

    /**
     * Get activities by course
     */
    async findByCourse(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const activities = await prisma.learningActivity.findMany({
            where: { courseId, deletedAt: null },
            skip,
            take: limit,
            include: {
                course: { select: { id: true, title: true } },
                contentActivity: true,
                assignment: true
            },
            orderBy: { displayOrder: 'asc' }
        });

        const total = await prisma.learningActivity.count({
            where: { courseId, deletedAt: null }
        });

        return { activities, total, page, limit };
    }

    /**
     * Get published activities by course
     */
    async findPublishedByCourse(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const activities = await prisma.learningActivity.findMany({
            where: { courseId, deletedAt: null, isPublished: true },
            skip,
            take: limit,
            include: {
                course: { select: { id: true, title: true } },
                contentActivity: true,
                assignment: true
            },
            orderBy: { displayOrder: 'asc' }
        });

        const total = await prisma.learningActivity.count({
            where: { courseId, deletedAt: null, isPublished: true }
        });

        return { activities, total, page, limit };
    }

    /**
     * Create activity
     */
    async createActivity(data) {
        return prisma.learningActivity.create({
            data,
            include: {
                course: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Update activity
     */
    async updateActivity(id, data) {
        return prisma.learningActivity.update({
            where: { id },
            data,
            include: {
                course: { select: { id: true, title: true } },
                contentActivity: true,
                assignment: true
            }
        });
    }

    /**
     * Soft delete activity
     */
    async deleteActivity(id) {
        return prisma.learningActivity.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create activity prerequisite
     */
    async createPrerequisite(data) {
        return prisma.activityPrerequisite.create({
            data,
            include: {
                activity: { select: { id: true, title: true } },
                prerequisiteActivity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Get activity prerequisites
     */
    async getPrerequisites(activityId) {
        return prisma.activityPrerequisite.findMany({
            where: { activityId, deletedAt: null },
            include: {
                prerequisiteActivity: true
            }
        });
    }

    /**
     * Delete activity prerequisite
     */
    async deletePrerequisite(id) {
        return prisma.activityPrerequisite.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create activity content
     */
    async createContent(data) {
        return prisma.contentActivity.create({
            data,
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Get activity content
     */
    async getContent(activityId) {
        return prisma.contentActivity.findFirst({
            where: { activityId, deletedAt: null },
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Update activity content
     */
    async updateContent(id, data) {
        return prisma.contentActivity.update({
            where: { id },
            data,
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Delete activity content
     */
    async deleteContent(id) {
        return prisma.contentActivity.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create assignment
     */
    async createAssignment(data) {
        return prisma.assignment.create({
            data,
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Get assignment
     */
    async getAssignment(activityId) {
        return prisma.assignment.findFirst({
            where: { activityId, deletedAt: null },
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Update assignment
     */
    async updateAssignment(id, data) {
        return prisma.assignment.update({
            where: { id },
            data,
            include: {
                activity: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Delete assignment
     */
    async deleteAssignment(id) {
        return prisma.assignment.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get activity stats
     */
    async getActivityStats(activityId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId }
        });

        if (!activity) return null;

        const studentTrackingCount = await prisma.studentActivityTracking.count({
            where: { activityId }
        });

        const submissionsCount = await prisma.submission.count({
            where: { activityId, deletedAt: null }
        });

        return {
            activityId,
            studentTrackingCount,
            submissionsCount,
            pointsValue: activity.points,
            lastUpdated: activity.updatedAt
        };
    }
}

module.exports = new ActivitiesRepository();
