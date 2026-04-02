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
 * GET /api/v1/lecturers
 * Get all lecturers (public)
 */
lecturerRoutes.get(
    '/',
    lecturerController.getAllLecturers
);

/**
 * POST /api/v1/lecturers
 * Create lecturer profile (Admin only)
 */
lecturerRoutes.post(
    '/',
    authMiddleware,
    requireRole(['ADMIN']),
    validateBody(LecturerCreateDTO),
    lecturerController.createLecturerProfile
);

/**
 * GET /api/v1/lecturers/:id
 * Get lecturer by ID (public)
 */
lecturerRoutes.get(
    '/:id',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerById
);

/**
 * GET /api/v1/lecturers/user/:userId
 * Get lecturer profile by user ID (public)
 */
lecturerRoutes.get(
    '/user/:userId',
    validateParams(UserIdDTO),
    lecturerController.getLecturerByUserId
);

/**
 * PUT /api/v1/lecturers/:id
 * Update lecturer profile (Admin/Self only)
 */
lecturerRoutes.put(
    '/:id',
    authMiddleware,
    validateParams(LecturerIdDTO),
    validateBody(LecturerUpdateDTO),
    lecturerController.updateLecturerProfile
);

/**
 * DELETE /api/v1/lecturers/:id
 * Delete lecturer profile (Admin only)
 */
lecturerRoutes.delete(
    '/:id',
    authMiddleware,
    requireRole(['ADMIN']),
    validateParams(LecturerIdDTO),
    lecturerController.deleteLecturerProfile
);

/**
 * GET /api/v1/lecturers/:id/courses
 * Get lecturer's courses (public)
 */
lecturerRoutes.get(
    '/:id/courses',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerCourses
);

/**
 * GET /api/v1/lecturers/:id/stats
 * Get lecturer statistics (public)
 */
lecturerRoutes.get(
    '/:id/stats',
    validateParams(LecturerIdDTO),
    lecturerController.getLecturerStats
);

module.exports = lecturerRoutes;
