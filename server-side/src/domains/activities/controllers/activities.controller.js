/**
 * Activities Controller
 * HTTP handlers for activity endpoints
 */

const { statusCodes } = require('../../../config/constants');
const activitiesService = require('../services/activities.service');
const {
    LearningActivityCreateDTO,
    LearningActivityUpdateDTO,
    ActivityPrerequisiteCreateDTO,
    ContentActivityCreateDTO,
    ContentActivityUpdateDTO,
    AssignmentCreateDTO,
    AssignmentUpdateDTO
} = require('../dtos/activities.dtos');

class ActivitiesController {
    /**
     * GET /api/v1/courses/:courseId/activities
     * Get activities by course
     */
    async getActivitiesByCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await activitiesService.getActivitiesByCourse(courseId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    activities: result.activities,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/activities/published
     * Get published activities by course
     */
    async getPublishedActivities(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await activitiesService.getPublishedActivities(courseId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    activities: result.activities,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:id
     * Get activity by ID
     */
    async getActivity(req, res, next) {
        try {
            const { id } = req.params;

            const activity = await activitiesService.getActivityById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities
     * Create new activity (Lecturer only)
     */
    async createActivity(req, res, next) {
        try {
            const validated = LearningActivityCreateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const activity = await activitiesService.createActivity(validated, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { activity },
                message: 'Activity created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/activities/:id
     * Update activity (Lecturer only)
     */
    async updateActivity(req, res, next) {
        try {
            const { id } = req.params;
            const validated = LearningActivityUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const activity = await activitiesService.updateActivity(id, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
                message: 'Activity updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/activities/:id
     * Delete activity (Lecturer only)
     */
    async deleteActivity(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await activitiesService.deleteActivity(id, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Activity deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:id/publish
     * Publish activity (Lecturer only)
     */
    async publishActivity(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const activity = await activitiesService.publishActivity(id, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
                message: 'Activity published successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:id/unpublish
     * Unpublish activity (Lecturer only)
     */
    async unpublishActivity(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const activity = await activitiesService.unpublishActivity(id, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
                message: 'Activity unpublished successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:id/stats
     * Get activity statistics
     */
    async getActivityStats(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await activitiesService.getActivityStats(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:activityId/prerequisites
     * Add activity prerequisite (Lecturer only)
     */
    async addPrerequisite(req, res, next) {
        try {
            const { activityId } = req.params;
            const { prerequisiteActivityId } = req.body;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const prerequisite = await activitiesService.addPrerequisite(
                activityId,
                prerequisiteActivityId,
                lecturerId
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { prerequisite },
                message: 'Prerequisite added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/prerequisites
     * Get activity prerequisites
     */
    async getPrerequisites(req, res, next) {
        try {
            const { activityId } = req.params;

            const prerequisites = await activitiesService.getPrerequisites(activityId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { prerequisites }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/content
     * Get activity content
     */
    async getContent(req, res, next) {
        try {
            const { activityId } = req.params;

            const content = await activitiesService.getContent(activityId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { content }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:activityId/content
     * Add activity content (Lecturer only)
     */
    async addContent(req, res, next) {
        try {
            const { activityId } = req.params;
            const validated = ContentActivityCreateDTO.parse({
                activityId,
                ...req.body
            });
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const content = await activitiesService.addContent(activityId, {
                content: validated.content,
                contentType: validated.contentType
            }, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { content },
                message: 'Content added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/activities/content/:contentId
     * Update activity content (Lecturer only)
     */
    async updateContent(req, res, next) {
        try {
            const { contentId } = req.params;
            const validated = ContentActivityUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const content = await activitiesService.updateContent(contentId, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { content },
                message: 'Content updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/activities/content/:contentId
     * Delete activity content (Lecturer only)
     */
    async deleteContent(req, res, next) {
        try {
            const { contentId } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await activitiesService.deleteContent(contentId, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Content deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/assignment
     * Get activity assignment
     */
    async getAssignment(req, res, next) {
        try {
            const { activityId } = req.params;

            const assignment = await activitiesService.getAssignment(activityId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { assignment }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:activityId/assignment
     * Add activity assignment (Lecturer only)
     */
    async addAssignment(req, res, next) {
        try {
            const { activityId } = req.params;
            const validated = AssignmentCreateDTO.parse({
                activityId,
                ...req.body
            });
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const assignment = await activitiesService.addAssignment(activityId, {
                instructions: validated.instructions,
                dueDate: validated.dueDate,
                rubric: validated.rubric
            }, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { assignment },
                message: 'Assignment added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/activities/assignment/:assignmentId
     * Update activity assignment (Lecturer only)
     */
    async updateAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const validated = AssignmentUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const assignment = await activitiesService.updateAssignment(assignmentId, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { assignment },
                message: 'Assignment updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/activities/assignment/:assignmentId
     * Delete activity assignment (Lecturer only)
     */
    async deleteAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await activitiesService.deleteAssignment(assignmentId, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Assignment deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ActivitiesController();
