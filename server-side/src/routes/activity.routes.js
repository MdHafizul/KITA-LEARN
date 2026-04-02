const express = require('express');
const { activityController } = require('../controllers');
const { validateBody, validateParams } = require('../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { ActivityCreateDTO, ActivityUpdateDTO } = require('../models/dtos');
const { z } = require('zod');

const activityRoutes = express.Router();

const ActivityIdDTO = z.object({ id: z.union([z.string().cuid(), z.string().uuid()]) });

/**
 * GET /api/v1/activities
 * Get all activities for a course
 * Query: courseId, page, limit
 */
activityRoutes.get(
    '/',
    activityController.getAllActivities
);

/**
 * POST /api/v1/activities
 * Create new activity (Lecturer only)
 */
activityRoutes.post(
    '/',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateBody(ActivityCreateDTO),
    activityController.createActivity
);

/**
 * GET /api/v1/activities/:id
 * Get activity details
 */
activityRoutes.get(
    '/:id',
    validateParams(ActivityIdDTO),
    activityController.getActivity
);

/**
 * PUT /api/v1/activities/:id
 * Update activity (Lecturer only)
 */
activityRoutes.put(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    validateBody(ActivityUpdateDTO),
    activityController.updateActivity
);

/**
 * POST /api/v1/activities/:id/publish
 * Toggle publish status (Lecturer only)
 */
activityRoutes.post(
    '/:id/publish',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    activityController.togglePublish
);

/**
 * DELETE /api/v1/activities/:id
 * Delete activity (Lecturer only)
 */
activityRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    activityController.deleteActivity
);

/**
 * GET /api/v1/activities/:id/progress
 * Get student progress on activity
 */
activityRoutes.get(
    '/:id/progress',
    authMiddleware,
    validateParams(ActivityIdDTO),
    activityController.getActivityProgress
);

module.exports = activityRoutes;
