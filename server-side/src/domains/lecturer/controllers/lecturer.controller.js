/**
 * Lecturer Controller
 * HTTP handlers for lecturer endpoints
 */

const { statusCodes } = require('../../../config/constants');
const lecturerService = require('../services/lecturer.service');
const { LecturerCreateDTO, LecturerUpdateDTO } = require('../dtos/lecturer.dtos');

class LecturerController {
    /**
     * GET /api/v1/lecturers
     * Get all lecturers with pagination
     */
    async getAllLecturers(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const result = await lecturerService.getAllLecturers({
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    lecturers: result.lecturers,
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
     * GET /api/v1/lecturers/:id
     * Get lecturer by ID
     */
    async getLecturerById(req, res, next) {
        try {
            const { id } = req.params;

            const lecturer = await lecturerService.getLecturerById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { lecturer }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/lecturers/user/:userId
     * Get lecturer profile by user ID
     */
    async getLecturerByUserId(req, res, next) {
        try {
            const { userId } = req.params;

            const lecturer = await lecturerService.getLecturerByUserId(userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { lecturer }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/lecturers
     * Create lecturer profile (Admin only)
     */
    async createLecturerProfile(req, res, next) {
        try {
            const validated = LecturerCreateDTO.parse(req.body);

            const lecturer = await lecturerService.createLecturerProfile(validated);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { lecturer },
                message: 'Lecturer profile created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/lecturers/:id
     * Update lecturer profile (Admin/Self only)
     */
    async updateLecturerProfile(req, res, next) {
        try {
            const { id } = req.params;
            const validated = LecturerUpdateDTO.parse(req.body);

            const lecturer = await lecturerService.updateLecturerProfile(id, validated);

            res.status(statusCodes.OK).json({
                success: true,
                data: { lecturer },
                message: 'Lecturer profile updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/lecturers/:id
     * Delete lecturer profile (Admin only)
     */
    async deleteLecturerProfile(req, res, next) {
        try {
            const { id } = req.params;

            await lecturerService.deleteLecturerProfile(id);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Lecturer profile deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/lecturers/:id/courses
     * Get lecturer's courses
     */
    async getLecturerCourses(req, res, next) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await lecturerService.getLecturerCourses(id, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    courses: result.courses,
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
     * GET /api/v1/lecturers/:id/stats
     * Get lecturer statistics
     */
    async getLecturerStats(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await lecturerService.getLecturerStats(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LecturerController();
