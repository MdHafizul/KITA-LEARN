/**
 * Activities Service
 * Business logic for learning activity operations
 */

const { ValidationException } = require('../../../exceptions');
const activitiesRepository = require('../repositories/activities.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class ActivitiesService {
    /**
     * Get activity by ID
     */
    async getActivityById(id) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        return activity;
    }

    /**
     * Get activities by course
     */
    async getActivitiesByCourse(courseId, pagination) {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return activitiesRepository.findByCourse(courseId, pagination);
    }

    /**
     * Get published activities by course
     */
    async getPublishedActivities(courseId, pagination) {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return activitiesRepository.findPublishedByCourse(courseId, pagination);
    }

    /**
     * Create activity
     */
    async createActivity(data, lecturerId) {
        const course = await prisma.course.findUnique({
            where: { id: data.courseId }
        });

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to create activities in this course');
        }

        const activityData = {
            ...data,
            isPublished: false
        };

        return activitiesRepository.createActivity(activityData);
    }

    /**
     * Update activity
     */
    async updateActivity(id, data, lecturerId) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this activity');
        }

        return activitiesRepository.updateActivity(id, data);
    }

    /**
     * Delete activity (soft delete)
     */
    async deleteActivity(id, lecturerId) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this activity');
        }

        return activitiesRepository.deleteActivity(id);
    }

    /**
     * Publish activity
     */
    async publishActivity(id, lecturerId) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to publish this activity');
        }

        return activitiesRepository.updateActivity(id, { isPublished: true });
    }

    /**
     * Unpublish activity
     */
    async unpublishActivity(id, lecturerId) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to unpublish this activity');
        }

        return activitiesRepository.updateActivity(id, { isPublished: false });
    }

    /**
     * Add activity prerequisite
     */
    async addPrerequisite(activityId, prerequisiteActivityId, lecturerId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to modify this activity');
        }

        const prerequisiteActivity = await activitiesRepository.findActivityById(prerequisiteActivityId);
        if (!prerequisiteActivity) {
            throw new ValidationException('Prerequisite activity not found');
        }

        if (prerequisiteActivity.courseId !== activity.courseId) {
            throw new ValidationException('Prerequisite must be in the same course');
        }

        return activitiesRepository.createPrerequisite({
            activityId,
            prerequisiteActivityId
        });
    }

    /**
     * Get activity prerequisites
     */
    async getPrerequisites(activityId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        return activitiesRepository.getPrerequisites(activityId);
    }

    /**
     * Remove activity prerequisite
     */
    async removePrerequisite(id, lecturerId) {
        const prerequisite = await prisma.activityPrerequisite.findUnique({
            where: { id },
            include: { activity: { include: { course: true } } }
        });

        if (!prerequisite) {
            throw new ValidationException('Prerequisite not found');
        }

        if (prerequisite.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized');
        }

        return activitiesRepository.deletePrerequisite(id);
    }

    /**
     * Add activity content
     */
    async addContent(activityId, data, lecturerId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to add content to this activity');
        }

        if (activity.content) {
            throw new ValidationException('Content already exists for this activity');
        }

        return activitiesRepository.createContent({
            activityId,
            ...data
        });
    }

    /**
     * Get activity content
     */
    async getContent(activityId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        return activitiesRepository.getContent(activityId);
    }

    /**
     * Update activity content
     */
    async updateContent(contentId, data, lecturerId) {
        const content = await prisma.contentActivity.findUnique({
            where: { id: contentId },
            include: { activity: { include: { course: true } } }
        });

        if (!content) {
            throw new ValidationException('Content not found');
        }

        if (content.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this content');
        }

        return activitiesRepository.updateContent(contentId, data);
    }

    /**
     * Delete activity content
     */
    async deleteContent(contentId, lecturerId) {
        const content = await prisma.contentActivity.findUnique({
            where: { id: contentId },
            include: { activity: { include: { course: true } } }
        });

        if (!content) {
            throw new ValidationException('Content not found');
        }

        if (content.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this content');
        }

        return activitiesRepository.deleteContent(contentId);
    }

    /**
     * Add assignment
     */
    async addAssignment(activityId, data, lecturerId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to add assignment to this activity');
        }

        if (activity.assignment) {
            throw new ValidationException('Assignment already exists for this activity');
        }

        return activitiesRepository.createAssignment({
            activityId,
            ...data
        });
    }

    /**
     * Get assignment
     */
    async getAssignment(activityId) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        return activitiesRepository.getAssignment(activityId);
    }

    /**
     * Update assignment
     */
    async updateAssignment(assignmentId, data, lecturerId) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { activity: { include: { course: true } } }
        });

        if (!assignment) {
            throw new ValidationException('Assignment not found');
        }

        if (assignment.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this assignment');
        }

        return activitiesRepository.updateAssignment(assignmentId, data);
    }

    /**
     * Delete assignment
     */
    async deleteAssignment(assignmentId, lecturerId) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { activity: { include: { course: true } } }
        });

        if (!assignment) {
            throw new ValidationException('Assignment not found');
        }

        if (assignment.activity.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this assignment');
        }

        return activitiesRepository.deleteAssignment(assignmentId);
    }

    /**
     * Get activity statistics
     */
    async getActivityStats(id) {
        const activity = await activitiesRepository.findActivityById(id);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        return activitiesRepository.getActivityStats(id);
    }
}

module.exports = new ActivitiesService();
