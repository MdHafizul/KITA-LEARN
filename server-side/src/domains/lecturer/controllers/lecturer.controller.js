/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Lecturer Controller
 * HTTP handlers for lecturer endpoints
 */

const { statusCodes } = require('../../../config/constants');
const lecturerService = require('../services/lecturer.service');
const { LecturerCreateDTO, LecturerUpdateDTO } = require('../dtos/lecturer.dtos');

class LecturerController {
    /**
     * @DESC: Retrieve all lecturers with pagination
     * @Params: page (query), limit (query)
     * @Body: N/A
     * @Auth: Public - No authentication required
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
     * @DESC: Retrieve a single lecturer by ID
     * @Params: id (path) - Lecturer CUID/UUID
     * @Body: N/A
     * @Auth: Public - No authentication required
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
     * @DESC: Retrieve lecturer profile by associated user ID
     * @Params: userId (path) - User CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Create a new lecturer profile
     * @Params: N/A
     * @Body: { userId, department, qualification, yearsExperience, specialization }
     * @Auth: Bearer token + [admin] role required
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
     * @DESC: Update existing lecturer profile
     * @Params: id (path) - Lecturer CUID/UUID
     * @Body: { department, qualification, yearsExperience, specialization } - all fields optional
     * @Auth: Bearer token + [admin] role required
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
     * @DESC: Delete lecturer profile (soft delete)
     * @Params: id (path) - Lecturer CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [admin] role required
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
     * @DESC: Retrieve all courses taught by a lecturer
     * @Params: id (path) - Lecturer CUID/UUID, page (query), limit (query)
     * @Body: N/A
     * @Auth: Bearer token required
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
     * @DESC: Retrieve lecturer performance and activity statistics
     * @Params: id (path) - Lecturer CUID/UUID
     * @Body: N/A
     * @Auth: Bearer token + [admin, lecturer] role required
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

