/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Lecturer Routes
 * HTTP routes for lecturer endpoints
 */

const express = require('express');
const { validateBody, validateParams } = require('../../../middleware/validation.middleware');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');
const lecturerController = require('../controllers/lecturer.controller');
const { LecturerCreateDTO, LecturerUpdateDTO } = require('../dtos/lecturer.dtos');
const { z } = require('zod');

const lecturerRoutes = express.Router();

const LecturerIdDTO = z.object({
    id: z.union([z.string().cuid(), z.string().uuid()])
});

const UserIdDTO = z.object({
    userId: z.union([z.string().cuid(), z.string().uuid()])
});

/**
 * @route GET /api/v1/lecturers
 * @access Public
 * @Params: page (query, default: 1), limit (query, default: 10)
 * @Body: N/A
 */
lecturerRoutes.get(
    '/',
    lecturerController.getAllLecturers
);

/**
 * @route POST /api/v1/lecturers
 * @access Private - [admin]
 * @Params: N/A
 * @Body: { userId, department, qualification, yearsExperience, specialization }
 */
lecturerRoutes.post(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    validateBody(LecturerCreateDTO),
    lecturerController.createLecturerProfile
);

/**
 * @route GET /api/v1/lecturers/:id
 * @access Public
 * @Params: id (path) - Lecturer CUID/UUID
 * @Body: N/A
 */
lecturerRoutes.get(
    '/:id',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerById
);

/**
 * @route GET /api/v1/lecturers/user/:userId
 * @access Public
 * @Params: userId (path) - User CUID/UUID
 * @Body: N/A
 */
lecturerRoutes.get(
    '/user/:userId',
    validateParams(UserIdDTO),
    lecturerController.getLecturerByUserId
);

/**
 * @route PUT /api/v1/lecturers/:id
 * @access Private - [admin, lecturer]
 * @Params: id (path) - Lecturer CUID/UUID
 * @Body: { department?, qualification?, yearsExperience?, specialization? } - all optional
 */
lecturerRoutes.put(
    '/:id',
    authMiddleware,
    validateParams(LecturerIdDTO),
    validateBody(LecturerUpdateDTO),
    lecturerController.updateLecturerProfile
);

/**
 * @route DELETE /api/v1/lecturers/:id
 * @access Private - [admin]
 * @Params: id (path) - Lecturer CUID/UUID
 * @Body: N/A
 */
lecturerRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['ADMIN']),
    validateParams(LecturerIdDTO),
    lecturerController.deleteLecturerProfile
);

/**
 * @route GET /api/v1/lecturers/:id/courses
 * @access Public
 * @Params: id (path) - Lecturer CUID/UUID, page (query, default: 1), limit (query, default: 10)
 * @Body: N/A
 */
lecturerRoutes.get(
    '/:id/courses',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerCourses
);

/**
 * @route GET /api/v1/lecturers/:id/stats
 * @access Private - [admin, lecturer]
 * @Params: id (path) - Lecturer CUID/UUID
 * @Body: N/A
 */
lecturerRoutes.get(
    '/:id/stats',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerStats
);

module.exports = lecturerRoutes;


