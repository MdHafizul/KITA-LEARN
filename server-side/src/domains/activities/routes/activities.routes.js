/**
 * Activities Routes
 * HTTP routes for activity endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
const activitiesController = require('../controllers/activities.controller');
const {
    LearningActivityCreateDTO,
    LearningActivityUpdateDTO,
    ActivityPrerequisiteCreateDTO,
    ContentActivityCreateDTO,
    ContentActivityUpdateDTO,
    AssignmentCreateDTO,
    AssignmentUpdateDTO
} = require('../dtos/activities.dtos');
const { z } = require('zod');

const activitiesRoutes = express.Router();

const ActivityIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const ActivityIdParamDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()])
});

const ContentIdDTO = z.object({
    contentId: z.union([z.string().cuid(), z.string().uuid()])
});

const AssignmentIdDTO = z.object({
    assignmentId: z.union([z.string().cuid(), z.string().uuid()])
});

const CourseIdDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()])
});

/**
 * GET /api/v1/courses/:courseId/activities
 * Get activities by course
 */
activitiesRoutes.get(
    '/course/:courseId',
    validateParams(CourseIdDTO),
    activitiesController.getActivitiesByCourse
);

/**
 * GET /api/v1/courses/:courseId/activities/published
 * Get published activities by course
 */
activitiesRoutes.get(
    '/course/:courseId/published',
    validateParams(CourseIdDTO),
    activitiesController.getPublishedActivities
);

/**
 * POST /api/v1/activities
 * Create new activity (Lecturer only)
 */
activitiesRoutes.post(
    '/',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateBody(LearningActivityCreateDTO),
    activitiesController.createActivity
);

/**
 * GET /api/v1/activities/:id
 * Get activity by ID
 */
activitiesRoutes.get(
    '/:id',
    validateParams(ActivityIdDTO),
    activitiesController.getActivity
);

/**
 * PUT /api/v1/activities/:id
 * Update activity (Lecturer only)
 */
activitiesRoutes.put(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    validateBody(LearningActivityUpdateDTO),
    activitiesController.updateActivity
);

/**
 * POST /api/v1/activities/:id/publish
 * Publish activity (Lecturer only)
 */
activitiesRoutes.post(
    '/:id/publish',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    activitiesController.publishActivity
);

/**
 * POST /api/v1/activities/:id/unpublish
 * Unpublish activity (Lecturer only)
 */
activitiesRoutes.post(
    '/:id/unpublish',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    activitiesController.unpublishActivity
);

/**
 * DELETE /api/v1/activities/:id
 * Delete activity (Lecturer only)
 */
activitiesRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdDTO),
    activitiesController.deleteActivity
);

/**
 * GET /api/v1/activities/:id/stats
 * Get activity statistics
 */
activitiesRoutes.get(
    '/:id/stats',
    validateParams(ActivityIdDTO),
    activitiesController.getActivityStats
);

/**
 * GET /api/v1/activities/:activityId/prerequisites
 * Get activity prerequisites
 */
activitiesRoutes.get(
    '/:activityId/prerequisites',
    validateParams(ActivityIdParamDTO),
    activitiesController.getPrerequisites
);

/**
 * POST /api/v1/activities/:activityId/prerequisites
 * Add activity prerequisite (Lecturer only)
 */
activitiesRoutes.post(
    '/:activityId/prerequisites',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdParamDTO),
    validateBody(ActivityPrerequisiteCreateDTO),
    activitiesController.addPrerequisite
);

/**
 * GET /api/v1/activities/:activityId/content
 * Get activity content
 */
activitiesRoutes.get(
    '/:activityId/content',
    validateParams(ActivityIdParamDTO),
    activitiesController.getContent
);

/**
 * POST /api/v1/activities/:activityId/content
 * Add activity content (Lecturer only)
 */
activitiesRoutes.post(
    '/:activityId/content',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdParamDTO),
    validateBody(ContentActivityCreateDTO),
    activitiesController.addContent
);

/**
 * PUT /api/v1/activities/content/:contentId
 * Update activity content (Lecturer only)
 */
activitiesRoutes.put(
    '/content/:contentId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ContentIdDTO),
    validateBody(ContentActivityUpdateDTO),
    activitiesController.updateContent
);

/**
 * DELETE /api/v1/activities/content/:contentId
 * Delete activity content (Lecturer only)
 */
activitiesRoutes.delete(
    '/content/:contentId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ContentIdDTO),
    activitiesController.deleteContent
);

/**
 * GET /api/v1/activities/:activityId/assignment
 * Get activity assignment
 */
activitiesRoutes.get(
    '/:activityId/assignment',
    validateParams(ActivityIdParamDTO),
    activitiesController.getAssignment
);

/**
 * POST /api/v1/activities/:activityId/assignment
 * Add activity assignment (Lecturer only)
 */
activitiesRoutes.post(
    '/:activityId/assignment',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(ActivityIdParamDTO),
    validateBody(AssignmentCreateDTO),
    activitiesController.addAssignment
);

/**
 * PUT /api/v1/activities/assignment/:assignmentId
 * Update activity assignment (Lecturer only)
 */
activitiesRoutes.put(
    '/assignment/:assignmentId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(AssignmentIdDTO),
    validateBody(AssignmentUpdateDTO),
    activitiesController.updateAssignment
);

/**
 * DELETE /api/v1/activities/assignment/:assignmentId
 * Delete activity assignment (Lecturer only)
 */
activitiesRoutes.delete(
    '/assignment/:assignmentId',
    authMiddleware,
    requireRole(['LECTURER', 'ADMIN']),
    validateParams(AssignmentIdDTO),
    activitiesController.deleteAssignment
);

module.exports = activitiesRoutes;
