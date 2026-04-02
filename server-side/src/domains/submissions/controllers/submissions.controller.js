/**
 * Submissions Controller
 * HTTP handlers for submission endpoints
 */

const { statusCodes } = require('../../../config/constants');
const submissionsService = require('../services/submissions.service');
const {
    SubmissionCreateDTO,
    SubmissionUpdateDTO,
    SubmissionGradeDTO,
    BatchGradeDTO
} = require('../dtos/submissions.dtos');

class SubmissionsController {
    /**
     * GET /api/v1/submissions/:id
     * Get submission by ID
     */
    async getSubmission(req, res, next) {
        try {
            const { id } = req.params;
            const submission = await submissionsService.getSubmissionById(id);

            res.status(statusCodes.OK).json({
                success: true,
                data: submission
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/submissions
     * Get submissions for activity (instructor only)
     */
    async getSubmissionsByActivity(req, res, next) {
        try {
            const { activityId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const { userId, role } = req.user;

            const result = await submissionsService.getSubmissionsByActivity(
                activityId,
                { page: parseInt(page), limit: parseInt(limit) },
                userId,
                role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: result.submissions,
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
     * GET /api/v1/me/submissions
     * Get current user's submissions
     */
    async getMySubmissions(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const { userId } = req.user;

            const result = await submissionsService.getSubmissionsByUser(userId, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: result.submissions,
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
     * GET /api/v1/submissions
     * Get submissions with filters (admin only)
     */
    async listSubmissions(req, res, next) {
        try {
            const { activityId, userId, status, isLate, page = 1, limit = 10 } = req.query;

            const filters = {};
            if (activityId) filters.activityId = activityId;
            if (userId) filters.userId = userId;
            if (status) filters.status = status;
            if (isLate !== undefined) filters.isLate = isLate === 'true';

            const result = await submissionsService.getSubmissionsFiltered(filters, {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(statusCodes.OK).json({
                success: true,
                data: result.submissions,
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
     * POST /api/v1/activities/:activityId/submissions
     * Create/open submission for activity
     */
    async createSubmission(req, res, next) {
        try {
            const { activityId } = req.params;
            const { userId } = req.user;

            const submission = await submissionsService.createSubmission(activityId, userId);

            res.status(statusCodes.CREATED).json({
                success: true,
                data: submission,
                message: 'Submission opened successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/submissions/:id
     * Update submission draft
     */
    async updateSubmission(req, res, next) {
        try {
            const { id } = req.params;
            const validated = SubmissionUpdateDTO.parse(req.body);
            const { userId, role } = req.user;

            const submission = await submissionsService.updateSubmission(id, validated, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: submission,
                message: 'Submission updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/submissions/:id/submit
     * Submit assignment
     */
    async submitAssignment(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            const submission = await submissionsService.submitAssignment(id, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: submission,
                message: 'Assignment submitted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/submissions/:id/grade
     * Grade submission (instructor only)
     */
    async gradeSubmission(req, res, next) {
        try {
            const { id } = req.params;
            const validated = SubmissionGradeDTO.parse(req.body);
            const { userId, role } = req.user;

            const submission = await submissionsService.gradeSubmission(
                id,
                validated.score,
                validated.feedback,
                userId,
                role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: submission,
                message: 'Submission graded successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/activities/:activityId/submissions/batch-grade
     * Grade multiple submissions (instructor only)
     */
    async batchGradeSubmissions(req, res, next) {
        try {
            const { activityId } = req.params;
            const validated = BatchGradeDTO.parse({
                activityId,
                grades: req.body.grades
            });
            const { userId, role } = req.user;

            const result = await submissionsService.batchGrade(
                validated.activityId,
                validated.grades,
                userId,
                role
            );

            res.status(statusCodes.OK).json({
                success: true,
                data: result,
                message: `Graded ${result.successful.length} submissions`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/submissions/:id/return
     * Return submission for revision (instructor only)
     */
    async returnForRevision(req, res, next) {
        try {
            const { id } = req.params;
            const { feedback } = req.body;
            const { userId, role } = req.user;

            const submission = await submissionsService.returnForRevision(id, feedback, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: submission,
                message: 'Submission returned for revision'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/submissions/:id
     * Delete submission
     */
    async deleteSubmission(req, res, next) {
        try {
            const { id } = req.params;
            const { userId, role } = req.user;

            await submissionsService.deleteSubmission(id, userId, role);

            res.status(statusCodes.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/submissions/stats
     * Get submission statistics for activity (instructor only)
     */
    async getActivityStats(req, res, next) {
        try {
            const { activityId } = req.params;
            const { userId, role } = req.user;

            const stats = await submissionsService.getActivityStatistics(activityId, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/me/submissions/stats
     * Get user submission statistics
     */
    async getUserStats(req, res, next) {
        try {
            const { userId } = req.user;

            const stats = await submissionsService.getUserStatistics(userId);

            res.status(statusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/submissions/late
     * Get late submissions (instructor only)
     */
    async getLateSubmissions(req, res, next) {
        try {
            const { activityId } = req.params;
            const { userId, role } = req.user;

            const submissions = await submissionsService.getLateSubmissions(activityId, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: submissions
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/activities/:activityId/submissions/ungraded
     * Get ungraded submissions (instructor only)
     */
    async getUngradedSubmissions(req, res, next) {
        try {
            const { activityId } = req.params;
            const { userId, role } = req.user;

            const submissions = await submissionsService.getUngradedSubmissions(activityId, userId, role);

            res.status(statusCodes.OK).json({
                success: true,
                data: submissions
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubmissionsController();
