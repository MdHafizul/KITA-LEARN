/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Courses Controller
 * HTTP handlers for course endpoints
 */

const { statusCodes } = require('../../../config/constants');
const coursesService = require('../services/courses.service');
const {
    CourseCreateDTO,
    CourseUpdateDTO,
    CoursePrerequisiteCreateDTO,
    CourseMaterialCreateDTO,
    CourseMaterialUpdateDTO
} = require('../dtos/courses.dtos');

class CoursesController {
    /**
     * GET /api/v1/courses
     * Get all published courses with pagination
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getAllCourses(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const result = await coursesService.getAllCourses({
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
     * GET /api/v1/courses/:id
     * Get course by ID
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getCourse(req, res, next) {
        try {
            const { id } = req.params;

            const course = await coursesService.getCourseById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { course }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/lecturers/:lecturerId/courses
     * Get courses by lecturer ID
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getCoursesByLecturer(req, res, next) {
        try {
            const { lecturerId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await coursesService.getCoursesByLecturerId(lecturerId, {
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
     * POST /api/v1/courses
     * Create new course (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async createCourse(req, res, next) {
        try {
            const validated = CourseCreateDTO.parse(req.body);
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated or user ID not found'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile. Contact admin to set up lecturer access.'
                });
            }

            const course = await coursesService.createCourse(validated, lecturerProfile.id);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { course },
                message: 'Course created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/courses/:id
     * Update course (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            const validated = CourseUpdateDTO.parse(req.body);
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const course = await coursesService.updateCourse(id, validated, lecturerProfile.id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { course },
                message: 'Course updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/courses/:id
     * Delete course (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async deleteCourse(req, res, next) {
        try {
            const { id } = req.params;
            const isAdmin = req.isAdmin || false;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile && !isAdmin) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const lecturerId = lecturerProfile?.id || null;
            await coursesService.deleteCourse(id, lecturerId, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Course deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/courses/:id/publish
     * Publish course (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async publishCourse(req, res, next) {
        try {
            const { id } = req.params;
            const isAdmin = req.isAdmin || false;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile && !isAdmin) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const lecturerId = lecturerProfile?.id || null;
            const course = await coursesService.publishCourse(id, lecturerId, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                data: { course },
                message: 'Course published successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/courses/:id/archive
     * Archive course (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async archiveCourse(req, res, next) {
        try {
            const { id } = req.params;
            const isAdmin = req.isAdmin || false;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Fetch lecturer profile using user ID
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId }
            });

            if (!lecturerProfile && !isAdmin) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'User does not have a lecturer profile'
                });
            }

            const lecturerId = lecturerProfile?.id || null;
            const course = await coursesService.archiveCourse(id, lecturerId, isAdmin);

            res.status(statusCodes.OK).json({
                success: true,
                data: { course },
                message: 'Course archived successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:id/stats
     * Get course statistics
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getCourseStats(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await coursesService.getCourseStats(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: { stats }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/courses/:courseId/prerequisites
     * Add course prerequisite (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async addPrerequisite(req, res, next) {
        try {
            const { courseId } = req.params;
            const { prerequisiteCourseId } = req.body;
            const lecturerId = req.user?.i

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const prerequisite = await coursesService.addPrerequisite(
                courseId,
                prerequisiteCourseId,
                lecturerId
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { prerequisite },
                message: 'Prerequisite added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/prerequisites
     * Get course prerequisites
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getPrerequisites(req, res, next) {
        try {
            const { courseId } = req.params;

            const prerequisites = await coursesService.getPrerequisites(courseId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { prerequisites }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/materials
     * Get course materials with pagination
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async getMaterials(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const result = await coursesService.getMaterials(courseId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: {
                    materials: result.materials,
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
     * POST /api/v1/courses/:courseId/materials
     * Add course material (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async addMaterial(req, res, next) {
        try {
            const { courseId } = req.params;
            const validated = CourseMaterialCreateDTO.parse({
                courseId,
                ...req.body
            });
            const lecturerId = req.user?.i

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const material = await coursesService.addMaterial(validated, lecturerId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: { material },
                message: 'Material added successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/courses/materials/:materialId
     * Update course material (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async updateMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const validated = CourseMaterialUpdateDTO.parse(req.body);
            const lecturerId = req.user?.i

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const material = await coursesService.updateMaterial(materialId, validated, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { material },
                message: 'Material updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/courses/materials/:materialId
     * Delete course material (Lecturer only)
     */
    /**
     * Desc: Controller function orchestrates request handling and JSON response mapping.
     * Params: Read required path/query values from req.params and req.query.
     * Body: Read request payload from req.body and validate via DTO/Zod before service call.
     * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
     */
    async deleteMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const lecturerId = req.user?.id;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await coursesService.deleteMaterial(materialId, lecturerId);

            res.status(statusCodes.OK).json({
                success: true,
                message: 'Material deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CoursesController();

