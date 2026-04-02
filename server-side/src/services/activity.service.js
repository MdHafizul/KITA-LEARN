/**
 * ActivityService - Business logic for learning activities
 */

const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');

const prisma = new PrismaClient();

class ActivityService {
    /**
     * Create a new activity
     */
    async createActivity(data, lecturerId) {
        const { courseId, title, description, activityType, contentFile, instructions, durationMinutes, maxAttempts, passingScore, startDate, endDate, points } = data;

        // Check if course exists and user is lecturer
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { lecturer: true },
        });

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturer.userId !== lecturerId) {
            throw new ValidationException('Only course lecturer can create activities');
        }

        // Create activity
        const activity = await prisma.learningActivity.create({
            data: {
                courseId,
                title,
                description,
                activityType,
                contentFile,
                instructions,
                durationMinutes,
                maxAttempts,
                passingScore,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                points,
                isPublished: false, // Default to unpublished
            },
            include: { course: true },
        });

        return activity;
    }

    /**
     * Get all activities for a course
     */
    async getAllActivities(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const activities = await prisma.learningActivity.findMany({
            where: { courseId, deletedAt: null },
            skip,
            take: limit,
            include: { course: true },
            orderBy: { displayOrder: 'asc' },
        });

        const total = await prisma.learningActivity.count({
            where: { courseId, deletedAt: null },
        });

        return {
            activities,
            page,
            limit,
            total,
        };
    }

    /**
     * Get activity by ID
     */
    async getActivityById(activityId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: {
                course: true,
                prerequisites: true,
                exam: true,
                assignment: true,
                contentActivity: true,
            },
        });

        return activity;
    }

    /**
     * Update activity
     */
    async updateActivity(activityId, data, lecturerId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { include: { lecturer: true } } },
        });

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturer.userId !== lecturerId) {
            throw new ValidationException('Only course lecturer can update activities');
        }

        // Update activity
        const updated = await prisma.learningActivity.update({
            where: { id: activityId },
            data: {
                title: data.title || activity.title,
                description: data.description !== undefined ? data.description : activity.description,
                contentFile: data.contentFile !== undefined ? data.contentFile : activity.contentFile,
                instructions: data.instructions !== undefined ? data.instructions : activity.instructions,
                durationMinutes: data.durationMinutes || activity.durationMinutes,
                maxAttempts: data.maxAttempts || activity.maxAttempts,
                passingScore: data.passingScore !== undefined ? data.passingScore : activity.passingScore,
                startDate: data.startDate ? new Date(data.startDate) : activity.startDate,
                endDate: data.endDate ? new Date(data.endDate) : activity.endDate,
                points: data.points !== undefined ? data.points : activity.points,
            },
            include: { course: true },
        });

        return updated;
    }

    /**
     * Toggle activity publish status
     */
    async togglePublish(activityId, lecturerId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { include: { lecturer: true } } },
        });

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturer.userId !== lecturerId) {
            throw new ValidationException('Only course lecturer can publish activities');
        }

        const updated = await prisma.learningActivity.update({
            where: { id: activityId },
            data: { isPublished: !activity.isPublished },
            include: { course: true },
        });

        return updated;
    }

    /**
     * Delete activity (soft delete)
     */
    async deleteActivity(activityId, lecturerId) {
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { include: { lecturer: true } } },
        });

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturer.userId !== lecturerId) {
            throw new ValidationException('Only course lecturer can delete activities');
        }

        await prisma.learningActivity.update({
            where: { id: activityId },
            data: { deletedAt: new Date() },
        });
    }

    /**
     * Get student progress on activity
     */
    async getActivityProgress(activityId, studentId) {
        const progress = await prisma.studentActivityTracking.findUnique({
            where: {
                userId_activityId: {
                    userId: studentId,
                    activityId: activityId,
                },
            },
            include: {
                activity: true,
            },
        });

        return progress;
    }
}

module.exports = new ActivityService();
