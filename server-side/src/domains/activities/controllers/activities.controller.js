/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

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
     * @DESC: Retrieve all activities for a specific course
     * @Params: courseId (path), page (query), limit (query)
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Retrieve only published activities for a course
     * @Params: courseId (path), page (query), limit (query)
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Retrieve a single activity by ID
     * @Params: id (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Create a new learning activity
     * @Params: N/A
     * @Body: { courseId, title, description, type, startDate, endDate, isPublished }
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async createActivity(req, res, next) {
        try {
            const validated = LearningActivityCreateDTO.parse(req.body);
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile. Contact admin to set up lecturer access.'
                });
            }

            const activity = await activitiesService.createActivity(validated, lecturerProfile.id);

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
     * @DESC: Update an existing learning activity
     * @Params: id (path) - Activity CUID/UUID
     * @Body: { title?, description?, type?, startDate?, endDate?, isPublished? } - all optional
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async updateActivity(req, res, next) {
        try {
            const { id } = req.params;
            const validated = LearningActivityUpdateDTO.parse(req.body);
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const activity = await activitiesService.updateActivity(id, validated, lecturerProfile.id);

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
     * @DESC: Delete an activity (soft delete)
     * @Params: id (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async deleteActivity(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            await activitiesService.deleteActivity(id, lecturerProfile.id);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Activity deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @DESC: Publish an activity (make it visible to students)
     * @Params: id (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async publishActivity(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const activity = await activitiesService.publishActivity(id, lecturerProfile.id);

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
     * @DESC: Unpublish an activity (hide from students)
     * @Params: id (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async unpublishActivity(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const activity = await activitiesService.unpublishActivity(id, lecturerProfile.id);

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
     * @DESC: Retrieve activity engagement and completion statistics
     * @Params: id (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
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
     * @DESC: Add a prerequisite activity to an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: { prerequisiteActivityId, isRequired }
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async addPrerequisite(req, res, next) {
        try {
            const { activityId } = req.params;
            const { prerequisiteActivityId } = req.body;
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const prerequisite = await activitiesService.addPrerequisite(
                activityId,
                prerequisiteActivityId,
                lecturerProfile.id,
                isAdmin
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
     * @DESC: Retrieve prerequisites for an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Retrieve content items for an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Add content item to an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: { contentType, title, description, resourceUrl, order }
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async addContent(req, res, next) {
        try {
            const { activityId } = req.params;
            const validated = ContentActivityCreateDTO.parse({
                activityId,
                ...req.body
            });
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const content = await activitiesService.addContent(activityId, {
                content: validated.content,
                contentType: validated.contentType
            }, lecturerProfile.id, isAdmin);

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
     * @DESC: Update activity content item
     * @Params: contentId (path) - Content CUID/UUID
     * @Body: { title?, description?, resourceUrl?, order? } - all optional
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async updateContent(req, res, next) {
        try {
            const { contentId } = req.params;
            const validated = ContentActivityUpdateDTO.parse(req.body);
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const content = await activitiesService.updateContent(contentId, validated, lecturerProfile.id, isAdmin);

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
     * @DESC: Delete activity content item
     * @Params: contentId (path) - Content CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async deleteContent(req, res, next) {
        try {
            const { contentId } = req.params;
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await activitiesService.deleteContent(contentId, lecturerProfile.id, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Content deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @DESC: Retrieve assignment details for an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Create assignment for an activity
     * @Params: activityId (path) - Activity CUID/UUID
     * @Body: { title, description, dueDate, totalPoints, submissionType }
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async addAssignment(req, res, next) {
        try {
            const { activityId } = req.params;
            const validated = AssignmentCreateDTO.parse({
                activityId,
                ...req.body
            });
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const assignment = await activitiesService.addAssignment(activityId, {
                instructions: validated.instructions,
                dueDate: validated.dueDate,
                rubric: validated.rubric
            }, lecturerProfile.id, isAdmin);

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
     * @DESC: Update assignment details
     * @Params: assignmentId (path) - Assignment CUID/UUID
     * @Body: { title?, description?, dueDate?, totalPoints?, submissionType? } - all optional
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async updateAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const validated = AssignmentUpdateDTO.parse(req.body);
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const assignment = await activitiesService.updateAssignment(assignmentId, validated, lecturerProfile.id, isAdmin);

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
     * @DESC: Delete assignment from activity
     * @Params: assignmentId (path) - Assignment CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [lecturer, admin] role required
     */
    async deleteAssignment(req, res, next) {
        try {
            const { assignmentId } = req.params;
            const userId = req.user?.id;
            const isAdmin = req.isAdmin || false;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await activitiesService.deleteAssignment(assignmentId, lecturerProfile.id, isAdmin);

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

