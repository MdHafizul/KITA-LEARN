/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Announcements Routes
 * HTTP routes for announcement endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent } = require('../../../middleware/auth.middleware');
const announcementsController = require('../controllers/announcements.controller');
const {
    AnnouncementCreateDTO,
    AnnouncementUpdateDTO,
    BulkAnnouncementCreateDTO
} = require('../dtos/announcements.dtos');
const { z } = require('zod');

const announcementsRoutes = express.Router();

const AnnouncementIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const CourseIdDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()])
});

const PriorityDTO = z.object({
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
});

// ============================================
// INDIVIDUAL ANNOUNCEMENT OPERATIONS
// ============================================

/**
 * GET /api/v1/announcements/:id
 * Get announcement by ID (public - any authenticated user)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/:id',
    authMiddleware,
    validateParams(AnnouncementIdDTO),
    announcementsController.getAnnouncement
);

/**
 * PUT /api/v1/announcements/:id
 * Update announcement (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.put(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AnnouncementIdDTO),
    validateBody(AnnouncementUpdateDTO),
    announcementsController.updateAnnouncement
);

/**
 * DELETE /api/v1/announcements/:id
 * Delete announcement (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AnnouncementIdDTO),
    announcementsController.deleteAnnouncement
);

/**
 * POST /api/v1/announcements/:id/read
 * Mark announcement as read by current user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.post(
    '/:id/read',
    authMiddleware,
    validateParams(AnnouncementIdDTO),
    announcementsController.markAsRead
);

/**
 * GET /api/v1/announcements/:id/stats
 * Get read statistics for announcement (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/:id/stats',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AnnouncementIdDTO),
    announcementsController.getReadStatistics
);

/**
 * POST /api/v1/announcements/:id/broadcast
 * Broadcast announcement to all enrolled students (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.post(
    '/:id/broadcast',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AnnouncementIdDTO),
    announcementsController.broadcastAnnouncement
);

// ============================================
// CURRENT USER ANNOUNCEMENT OPERATIONS
// ============================================

/**
 * GET /api/v1/me/announcements
 * Get announcements for current user dashboard
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/me/announcements',
    authMiddleware,
    announcementsController.getMyAnnouncements
);

/**
 * GET /api/v1/me/announcements/unread
 * Get unread announcements for current user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/me/announcements/unread',
    authMiddleware,
    announcementsController.getMyUnreadAnnouncements
);

/**
 * GET /api/v1/me/announcements/unread/count
 * Get unread announcement count for current user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/me/announcements/unread/count',
    authMiddleware,
    announcementsController.getMyUnreadCount
);

// ============================================
// COURSE ANNOUNCEMENT OPERATIONS
// ============================================

/**
 * POST /api/v1/announcements
 * Create announcement for course (lecturer only)
 * Body: { courseId, title, message, priority, announcementType }
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.post(
    '/',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(AnnouncementCreateDTO),
    announcementsController.createAnnouncement
);

/**
 * GET /api/v1/courses/:courseId/announcements
 * Get announcements for course
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/courses/:courseId',
    authMiddleware,
    validateParams(CourseIdDTO),
    announcementsController.getAnnouncementsByCourse
);

/**
 * GET /api/v1/courses/:courseId/announcements/priority/:priority
 * Get announcements by priority
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.get(
    '/courses/:courseId/announcements/priority/:priority',
    authMiddleware,
    validateParams(CourseIdDTO),
    announcementsController.getAnnouncementsByPriority
);

// ============================================
// BULK ANNOUNCEMENT OPERATIONS
// ============================================

/**
 * POST /api/v1/announcements/bulk
 * Create announcements in bulk (lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
announcementsRoutes.post(
    '/bulk',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(BulkAnnouncementCreateDTO),
    announcementsController.createBulkAnnouncements
);

module.exports = announcementsRoutes;


