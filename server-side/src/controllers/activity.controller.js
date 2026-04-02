/**
 * ActivityController - Handles learning activity management
 * Routes: GET/POST /activities, GET/PUT/DELETE /activities/:id, POST /activities/:id/publish
 */

const { statusCodes } = require('../config/constants');
const { ActivityService } = require('../services');
const { ActivityCreateDTO, ActivityUpdateDTO } = require('../models/dtos');

class ActivityController {
    /**
     * Get all activities for a course
     * GET /api/v1/activities?courseId=...&page=1&limit=10
     */
    async getAllActivities(req, res, next) {
        try {
            const { courseId, page = 1, limit = 10 } = req.query;

            const result = await ActivityService.getAllActivities(courseId, {
                page: parseInt(page),
                limit: parseInt(limit),
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    activities: result.activities,
                    pagination: {
                        page: result.page,
                        limit: result.limit,
                        total: result.total,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single activity
     * GET /api/v1/activities/:id
     */
    async getActivity(req, res, next) {
        try {
            const { id: activityId } = req.params;

            const activity = await ActivityService.getActivityById(activityId);

            if (!activity) {
                return res.status(statusCodes.NOT_FOUND).json({
                    success: false,
                    error: 'Activity not found',
                    code: 'ACTIVITY_NOT_FOUND',
                });
            }

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new activity (Lecturer only)
     * POST /api/v1/activities
     */
    async createActivity(req, res, next) {
        try {
            const validated = ActivityCreateDTO.parse(req.body);
            const userId = req.user.id;

            const activity = await ActivityService.createActivity(validated, userId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { activity },
                message: 'Activity created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update activity (Lecturer only)
     * PUT /api/v1/activities/:id
     */
    async updateActivity(req, res, next) {
        try {
            const validated = ActivityUpdateDTO.parse(req.body);
            const { id: activityId } = req.params;
            const userId = req.user.id;

            const activity = await ActivityService.updateActivity(activityId, validated, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
                message: 'Activity updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Toggle activity publish status
     * POST /api/v1/activities/:id/publish
     */
    async togglePublish(req, res, next) {
        try {
            const { id: activityId } = req.params;
            const userId = req.user.id;

            const activity = await ActivityService.togglePublish(activityId, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { activity },
                message: activity.isPublished ? 'Activity published' : 'Activity unpublished',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete activity (soft delete)
     * DELETE /api/v1/activities/:id
     */
    async deleteActivity(req, res, next) {
        try {
            const { id: activityId } = req.params;
            const userId = req.user.id;

            await ActivityService.deleteActivity(activityId, userId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Activity deleted',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get student progress on activity
     * GET /api/v1/activities/:id/progress
     */
    async getActivityProgress(req, res, next) {
        try {
            const { id: activityId } = req.params;
            const userId = req.user.id;

            const progress = await ActivityService.getActivityProgress(activityId, userId);

            if (!progress) {
                return res.status(statusCodes.NOT_FOUND).json({
                    success: false,
                    error: 'Progress not found',
                    code: 'NO_PROGRESS',
                });
            }

            res.status(statusCodes.OK).json({
                success: true,
                data: { progress },
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ActivityController();
