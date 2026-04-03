/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async addPrerequisite(activityId, prerequisiteActivityId, lecturerId, isAdmin = false) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (!isAdmin && activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to modify this activity');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async addContent(activityId, data, lecturerId, isAdmin = false) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (!isAdmin && activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to add content to this activity');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateContent(contentId, data, lecturerId, isAdmin = false) {
        const content = await prisma.contentActivity.findUnique({
            where: { id: contentId },
            include: { activity: { include: { course: true } } }
        });

        if (!content) {
            throw new ValidationException('Content not found');
        }

        if (!isAdmin && content.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to update this content');
            error.statusCode = 403;
            throw error;
        }

        return activitiesRepository.updateContent(contentId, data);
    }

    /**
     * Delete activity content
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteContent(contentId, lecturerId, isAdmin = false) {
        const content = await prisma.contentActivity.findUnique({
            where: { id: contentId },
            include: { activity: { include: { course: true } } }
        });

        if (!content) {
            throw new ValidationException('Content not found');
        }

        if (!isAdmin && content.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to delete this content');
            error.statusCode = 403;
            throw error;
        }

        return activitiesRepository.deleteContent(contentId);
    }

    /**
     * Add assignment
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async addAssignment(activityId, data, lecturerId, isAdmin = false) {
        const activity = await activitiesRepository.findActivityById(activityId);

        if (!activity) {
            throw new ValidationException('Activity not found');
        }

        if (!isAdmin && activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to add assignment to this activity');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateAssignment(assignmentId, data, lecturerId, isAdmin = false) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { activity: { include: { course: true } } }
        });

        if (!assignment) {
            throw new ValidationException('Assignment not found');
        }

        if (!isAdmin && assignment.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to update this assignment');
            error.statusCode = 403;
            throw error;
        }

        return activitiesRepository.updateAssignment(assignmentId, data);
    }

    /**
     * Delete assignment
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteAssignment(assignmentId, lecturerId, isAdmin = false) {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: { activity: { include: { course: true } } }
        });

        if (!assignment) {
            throw new ValidationException('Assignment not found');
        }

        if (!isAdmin && assignment.activity.course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to delete this assignment');
            error.statusCode = 403;
            throw error;
        }

        return activitiesRepository.deleteAssignment(assignmentId);
    }

    /**
     * Get activity statistics
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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

