/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Activities Routes
 * HTTP routes for activity endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent } = require('../../../middleware/auth.middleware');
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateBody(LearningActivityCreateDTO),
    activitiesController.createActivity
);

/**
 * GET /api/v1/activities/:id
 * Get activity by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.put(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    validateBody(LearningActivityUpdateDTO),
    activitiesController.updateActivity
);

/**
 * POST /api/v1/activities/:id/publish
 * Publish activity (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/:id/publish',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    activitiesController.publishActivity
);

/**
 * POST /api/v1/activities/:id/unpublish
 * Unpublish activity (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/:id/unpublish',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    activitiesController.unpublishActivity
);

/**
 * DELETE /api/v1/activities/:id
 * Delete activity (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.delete(
    '/:id',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdDTO),
    activitiesController.deleteActivity
);

/**
 * GET /api/v1/activities/:id/stats
 * Get activity statistics
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/:activityId/prerequisites',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdParamDTO),
    validateBody(ActivityPrerequisiteCreateDTO),
    activitiesController.addPrerequisite
);

/**
 * GET /api/v1/activities/:activityId/content
 * Get activity content
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/:activityId/content',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdParamDTO),
    validateBody(ContentActivityCreateDTO),
    activitiesController.addContent
);

/**
 * PUT /api/v1/activities/content/:contentId
 * Update activity content (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.put(
    '/content/:contentId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ContentIdDTO),
    validateBody(ContentActivityUpdateDTO),
    activitiesController.updateContent
);

/**
 * DELETE /api/v1/activities/content/:contentId
 * Delete activity content (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.delete(
    '/content/:contentId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ContentIdDTO),
    activitiesController.deleteContent
);

/**
 * GET /api/v1/activities/:activityId/assignment
 * Get activity assignment
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
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
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.post(
    '/:activityId/assignment',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(ActivityIdParamDTO),
    validateBody(AssignmentCreateDTO),
    activitiesController.addAssignment
);

/**
 * PUT /api/v1/activities/assignment/:assignmentId
 * Update activity assignment (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.put(
    '/assignment/:assignmentId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AssignmentIdDTO),
    validateBody(AssignmentUpdateDTO),
    activitiesController.updateAssignment
);

/**
 * DELETE /api/v1/activities/assignment/:assignmentId
 * Delete activity assignment (Lecturer only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
activitiesRoutes.delete(
    '/assignment/:assignmentId',
    authMiddleware,
    adminBypass,
    authorizeLecturer,
    validateParams(AssignmentIdDTO),
    activitiesController.deleteAssignment
);

module.exports = activitiesRoutes;


