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
    async createCourse(req, res, next) {
        try {
            const validated = CourseCreateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const course = await coursesService.createCourse(validated, lecturerId);

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
    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            const validated = CourseUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const course = await coursesService.updateCourse(id, validated, lecturerId);

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
    async deleteCourse(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            await coursesService.deleteCourse(id, lecturerId);

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
    async publishCourse(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const course = await coursesService.publishCourse(id, lecturerId);

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
    async archiveCourse(req, res, next) {
        try {
            const { id } = req.params;
            const lecturerId = req.user?.lecturerId;

            if (!lecturerId) {
                return res.status(statusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Lecturer profile not found'
                });
            }

            const course = await coursesService.archiveCourse(id, lecturerId);

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
    async addPrerequisite(req, res, next) {
        try {
            const { courseId } = req.params;
            const { prerequisiteCourseId } = req.body;
            const lecturerId = req.user?.lecturerId;

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
    async addMaterial(req, res, next) {
        try {
            const { courseId } = req.params;
            const validated = CourseMaterialCreateDTO.parse({
                courseId,
                ...req.body
            });
            const lecturerId = req.user?.lecturerId;

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
    async updateMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const validated = CourseMaterialUpdateDTO.parse(req.body);
            const lecturerId = req.user?.lecturerId;

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
    async deleteMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            const lecturerId = req.user?.lecturerId;

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
