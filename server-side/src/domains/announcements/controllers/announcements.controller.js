/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Announcements Controller
 * HTTP handlers for announcement endpoints
 */

const { statusCodes } = require('../../../config/constants');
const announcementsService = require('../services/announcements.service');
const {
    AnnouncementCreateDTO,
    AnnouncementUpdateDTO,
    BulkAnnouncementCreateDTO
} = require('../dtos/announcements.dtos');

class AnnouncementsController {
    // ============================================
    // ANNOUNCEMENT HANDLERS
    // ============================================

    /**
     * GET /api/v1/announcements/:id
     * Get announcement by ID
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getAnnouncement(req, res, next) {
        try {
            const { id } = req.params;
            const announcement = await announcementsService.getAnnouncementById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/announcements
     * Get announcements for course
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getAnnouncementsByCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10, active = false } = req.query;

            let announcements;
            if (active === 'true') {
                announcements = await announcementsService.getActiveAnnouncementsByCourse(
                    courseId,
                    { page: parseInt(page), limit: parseInt(limit) }
                );
            } else {
                announcements = await announcementsService.getAnnouncementsByCourse(
                    courseId,
                    { page: parseInt(page), limit: parseInt(limit) }
                );
            }

            res.status(statusCodes.OK).json({
                success: true,
                data: announcements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/announcements/priority/:priority
     * Get announcements by priority
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getAnnouncementsByPriority(req, res, next) {
        try {
            const { courseId, priority } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const announcements = await announcementsService.getAnnouncementsByPriority(
                courseId,
                priority,
                { page: parseInt(page), limit: parseInt(limit) }
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: announcements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/announcements
     * Get announcements for current user dashboard
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getMyAnnouncements(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const announcements = await announcementsService.getAnnouncementsForUserDashboard(
                req.user.id,
                { page: parseInt(page), limit: parseInt(limit) }
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: announcements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/announcements/unread
     * Get unread announcements for current user
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getMyUnreadAnnouncements(req, res, next) {
        try {
            const { courseId } = req.query;
            const { page = 1, limit = 10 } = req.query;

            if (!courseId) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'courseId is required'
                });
            }

            const announcements = await announcementsService.getUnreadAnnouncementsForUser(
                courseId,
                req.user.id,
                { page: parseInt(page), limit: parseInt(limit) }
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: announcements
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/announcements/unread/count
     * Get unread announcement count for user
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getMyUnreadCount(req, res, next) {
        try {
            const { courseId } = req.query;

            if (!courseId) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'courseId is required'
                });
            }

            const count = await announcementsService.getUnreadCountForUser(
                courseId,
                req.user.id
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: { unreadCount: count }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/announcements
     * Create announcement (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createAnnouncement(req, res, next) {
        try {
            const validatedData = AnnouncementCreateDTO.parse(req.body);
            const userId = req.user.id;
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

            const announcement = await announcementsService.createAnnouncement(
                validatedData,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/announcements/bulk
     * Create announcements in bulk (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createBulkAnnouncements(req, res, next) {
        try {
            const validatedData = BulkAnnouncementCreateDTO.parse(req.body);
            const userId = req.user.id;
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

            const result = await announcementsService.createBulkAnnouncements(
                validatedData.courseId,
                validatedData.announcements,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: result,
                message: `${result.count} announcements created`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/announcements/:id
     * Update announcement (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async updateAnnouncement(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = AnnouncementUpdateDTO.parse(req.body);
            const userId = req.user.id;
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

            const announcement = await announcementsService.updateAnnouncement(
                id,
                validatedData,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: announcement
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/announcements/:id
     * Delete announcement (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async deleteAnnouncement(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
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

            await announcementsService.deleteAnnouncement(id, lecturerProfile.id, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Announcement deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/announcements/:id/read
     * Mark announcement as read by current user
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async markAsRead(req, res, next) {
        try {
            const { id } = req.params;

            const recipient = await announcementsService.markAsRead(id, req.user.id);

            res.status(statusCodes.OK).json({
                success: true,
                data: recipient,
                message: 'Announcement marked as read'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/announcements/:id/stats
     * Get read statistics for announcement (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getReadStatistics(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await announcementsService.getReadStatistics(id, req.user.id);

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/announcements/:id/broadcast
     * Broadcast announcement to all enrolled students (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async broadcastAnnouncement(req, res, next) {
        try {
            const { id } = req.params;

            const result = await announcementsService.broadcastAnnouncement(id, req.user.id);

            res.status(statusCodes.OK).json({
                success: true,
                data: result,
                message: `Announcement broadcasted to ${result.count} students`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AnnouncementsController();

