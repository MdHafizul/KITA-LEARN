/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Grades Controller
 * HTTP handlers for grade endpoints
 */

const { statusCodes } = require('../../../config/constants');
const gradesService = require('../services/grades.service');
const {
    GradeCreateDTO,
    GradeUpdateDTO,
    BulkGradeDTO,
    GradeFilterDTO,
    RubricCreateDTO,
    RubricUpdateDTO
} = require('../dtos/grades.dtos');

class GradesController {
    // ============================================
    // GRADE HANDLERS
    // ============================================

    /**
     * GET /api/v1/grades/:id
     * Get grade by ID
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getGrade(req, res, next) {
        try {
            const { id } = req.params;
            const grade = await gradesService.getGradeById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: grade
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/grades
     * Get current user's grades
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getMyGrades(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const grades = await gradesService.getGradesByUser(
                req.user.id,
                { page: parseInt(page), limit: parseInt(limit) },
                req.user.id,
                req.user.role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grades
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/grades
     * Get grades for course (instructor only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getGradesByCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const grades = await gradesService.getGradesByCourse(
                courseId,
                { page: parseInt(page), limit: parseInt(limit) },
                req.user.id,
                req.user.role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grades
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/grades
     * Get grades for activity (instructor only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getGradesByActivity(req, res, next) {
        try {
            const { activityId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const grades = await gradesService.getGradesByActivity(
                activityId,
                { page: parseInt(page), limit: parseInt(limit) },
                req.user.id,
                req.user.role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grades
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/grades
     * Get grades with filters (admin only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async listGrades(req, res, next) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const grades = await gradesService.getGradesFiltered(
                filters,
                { page: parseInt(page), limit: parseInt(limit) },
                req.user.id,
                req.user.role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grades
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/grades
     * Create single grade (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createGrade(req, res, next) {
        try {
            const validatedData = GradeCreateDTO.parse(req.body);
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

            const grade = await gradesService.createGrade(
                validatedData,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: grade
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/grades/bulk
     * Create grades in bulk (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createBulkGrades(req, res, next) {
        try {
            const validatedData = BulkGradeDTO.parse(req.body);
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

            const result = await gradesService.createBulkGrades(
                validatedData.courseId,
                validatedData.activityId,
                validatedData.grades,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: result,
                message: `${result.count} grades created`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/grades/:id
     * Update grade (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async updateGrade(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = GradeUpdateDTO.parse(req.body);
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

            const grade = await gradesService.updateGrade(
                id,
                validatedData,
                lecturerProfile.id,
                isAdmin
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grade
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/grades/publish
     * Publish grades for student visibility (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async publishGrades(req, res, next) {
        try {
            const { ids, publishedAt } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'ids must be a non-empty array'
                });
            }

            const result = await gradesService.publishGrades(
                ids,
                req.user.id,
                publishedAt ? new Date(publishedAt) : null
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: result,
                message: `${result.count} grades published`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/grades/unpublish
     * Unpublish grades (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async unpublishGrades(req, res, next) {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'ids must be a non-empty array'
                });
            }

            const result = await gradesService.unpublishGrades(
                ids,
                req.user.id
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: result,
                message: `${result.count} grades unpublished`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/grades/:id
     * Delete grade (lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async deleteGrade(req, res, next) {
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

            await gradesService.deleteGrade(id, lecturerProfile.id, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Grade deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/grades/stats
     * Get grade statistics for course (instructor only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getCourseGradeStats(req, res, next) {
        try {
            const { courseId } = req.params;
            const isAdmin = req.isAdmin || false;

            const stats = await gradesService.getCourseGradeStatistics(
                courseId,
                req.user.id,
                isAdmin
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/grades/stats
     * Get grade statistics for activity (instructor only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getActivityGradeStats(req, res, next) {
        try {
            const { activityId } = req.params;
            const isAdmin = req.isAdmin || false;

            const stats = await gradesService.getActivityGradeStatistics(
                activityId,
                req.user.id,
                isAdmin
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/grades/unpublished
     * Get unpublished grades for review (instructor only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getUnpublishedGrades(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const grades = await gradesService.getUnpublishedGrades(
                courseId,
                { page: parseInt(page), limit: parseInt(limit) },
                req.user.id
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: grades
            });
        } catch (error) {
            next(error);
        }
    }

    // ============================================
    // GRADING RUBRIC HANDLERS
    // ============================================

    /**
     * GET /api/v1/rubrics/:id
     * Get rubric by ID
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getRubric(req, res, next) {
        try {
            const { id } = req.params;
            const rubric = await gradesService.getRubricById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: rubric
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/rubrics
     * Get all rubrics
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async listRubrics(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const rubrics = await gradesService.getAllRubrics({
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: rubrics
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/rubrics
     * Create grading rubric (lecturer/admin only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createRubric(req, res, next) {
        try {
            const validatedData = RubricCreateDTO.parse(req.body);

            const rubric = await gradesService.createRubric(
                validatedData,
                req.user.role
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: rubric
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/rubrics/:id
     * Update grading rubric (lecturer/admin only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async updateRubric(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = RubricUpdateDTO.parse(req.body);

            const rubric = await gradesService.updateRubric(
                id,
                validatedData,
                req.user.role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: rubric
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/rubrics/:id
     * Delete grading rubric (lecturer/admin only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async deleteRubric(req, res, next) {
        try {
            const { id } = req.params;

            await gradesService.deleteRubric(id, req.user.role);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Rubric deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GradesController();

