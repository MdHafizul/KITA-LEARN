/**
 * Enrollment Controller
 * HTTP handlers for enrollment endpoints
 */

const { statusCodes } = require('../../../config/constants');
const enrollmentService = require('../services/enrollment.service');
const {
    EnrollmentCreateDTO,
    EnrollmentUpdateDTO,
    BulkEnrollmentDTO,
    EnrollmentFilterDTO
} = require('../dtos/enrollment.dtos');

class EnrollmentController {
    /**
     * GET /api/v1/enrollments/:id
     * Get enrollment by ID
     */
    async getEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const enrollment = await enrollmentService.getEnrollmentById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/enrollments
     * Get enrollments for a course (course instructor only)
     */
    async getEnrollmentsByCourse(req, res, next) {
        try {
            const { courseId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const { userId, role } = req.user;

            const result = await enrollmentService.getEnrollmentsByCourse(
                courseId,
                { page: parseInt(page), limit: parseInt(limit) },
                userId,
                role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: result.enrollments,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/enrollments
     * Get current user's enrollments
     */
    async getMyEnrollments(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const { userId } = req.user;

            const result = await enrollmentService.getEnrollmentsByUser(userId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: result.enrollments,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/enrollments
     * Get enrollments with filters (admin only)
     */
    async listEnrollments(req, res, next) {
        try {
            const { courseId, userId, status, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (courseId) filters.courseId = courseId;
            if (userId) filters.userId = userId;
            if (status) filters.status = status;

            const result = await enrollmentService.getEnrollmentsFiltered(filters, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: result.enrollments,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    total: result.total
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/enrollments
     * Enroll student in course
     */
    async enrollUser(req, res, next) {
        try {
            const validated = EnrollmentCreateDTO.parse(req.body);
            const { userId } = req.user;

            // Student can only enroll themselves
            if (req.user.role !== 'ADMIN' && validated.userId !== userId) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'You can only enroll yourself'
                });
            }

            const enrollment = await enrollmentService.enrollUser(validated.courseId, validated.userId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: enrollment,
                message: 'Successfully enrolled in course'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/courses/:courseId/enrollments/bulk
     * Bulk enroll students (instructor only)
     */
    async bulkEnroll(req, res, next) {
        try {
            const { courseId } = req.params;
            const validated = BulkEnrollmentDTO.parse({
                courseId,
                userIds: req.body.userIds
            });
            const { userId, role } = req.user;

            const enrollments = await enrollmentService.bulkEnroll(
                validated.courseId,
                validated.userIds,
                userId,
                role
            );

            res.status(statusCodes.CREATED).json({
                success: true,
                data: enrollments,
                message: `Successfully enrolled ${enrollments.length} students`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/enrollments/:id
     * Update enrollment status or progress
     */
    async updateEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const validated = EnrollmentUpdateDTO.parse(req.body);
            const { userId, role } = req.user;

            const enrollment = await enrollmentService.updateEnrollment(id, validated, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment,
                message: 'Enrollment updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/enrollments/:id/progress
     * Update enrollment progress
     */
    async updateProgress(req, res, next) {
        try {
            const { id } = req.params;
            const { progressPercent } = req.body;
            const { userId } = req.user;

            if (typeof progressPercent !== 'number' || progressPercent < 0 || progressPercent > 100) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Progress must be a number between 0 and 100'
                });
            }

            const enrollment = await enrollmentService.updateProgress(id, progressPercent, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment,
                message: 'Progress updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/enrollments/:id/suspend
     * Suspend enrollment (instructor only)
     */
    async suspendEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            const enrollment = await enrollmentService.suspendEnrollment(id, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment,
                message: 'Enrollment suspended'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/enrollments/:id/complete
     * Mark enrollment as completed
     */
    async completeEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            const enrollment = await enrollmentService.completeEnrollment(id, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment,
                message: 'Enrollment marked as completed'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/enrollments/:id/drop
     * Drop enrollment (student action)
     */
    async dropEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            const enrollment = await enrollmentService.dropEnrollment(id, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: enrollment,
                message: 'Enrollment dropped'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/enrollments/:id
     * Delete enrollment (instructor only)
     */
    async deleteEnrollment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            await enrollmentService.deleteEnrollment(id, userId, role);

            res.status(statusCodes.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/courses/:courseId/enrollments/stats
     * Get course enrollment statistics (instructor only)
     */
    async getCourseStats(req, res, next) {
        try {
            const { courseId } = req.params;
            const { userId, role } = req.user;

            const stats = await enrollmentService.getCourseStatistics(courseId, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/enrollments/count
     * Get current user's active enrollment count
     */
    async getMyEnrollmentCount(req, res, next) {
        try {
            const { userId } = req.user;

            const count = await enrollmentService.getUserEnrollmentCount(userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/enrollments/check
     * Check if user is enrolled in course
     */
    async checkEnrollment(req, res, next) {
        try {
            const { courseId } = req.query;
            const { userId } = req.user;

            if (!courseId) {
                return res.status(statusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'courseId query parameter is required'
                });
            }

            const isEnrolled = await enrollmentService.isEnrolled(courseId, userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: { isEnrolled, courseId, userId }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EnrollmentController();
