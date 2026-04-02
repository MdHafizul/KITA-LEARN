/**
 * Submissions Service
 * Business logic for assignment submission operations
 */

const { ValidationException } = require('../../../exceptions');
const submissionsRepository = require('../repositories/submissions.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SubmissionsService {
    /**
     * Get submission by ID
     */
    async getSubmissionById(id) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        return submission;
    }

    /**
     * Get submissions for an activity (instructor only)
     */
    async getSubmissionsByActivity(activityId, pagination, requestorId, requestorRole) {
        // Verify activity exists and get course info
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        // Check authorization (lecturer OR admin)
        if (requestorRole !== 'ADMIN' && activity.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can view submissions', 403);
        }

        return submissionsRepository.findByActivity(activityId, pagination);
    }

    /**
     * Get submissions by user
     */
    async getSubmissionsByUser(userId, pagination) {
        return submissionsRepository.findByUser(userId, pagination);
    }

    /**
     * Get submissions with filters
     */
    async getSubmissionsFiltered(filters, pagination) {
        return submissionsRepository.findWithFilters(filters, pagination);
    }

    /**
     * Create/initialize submission (open submission for activity)
     */
    async createSubmission(activityId, userId) {
        // Verify activity exists
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            select: { id: true, activityType: true, startDate: true, endDate: true, deletedAt: true }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        if (activity.deletedAt) {
            throw new ValidationException('Activity has been deleted', 410);
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, deletedAt: true }
        });

        if (!user) {
            throw new ValidationException('User not found', 404);
        }

        if (user.deletedAt) {
            throw new ValidationException('User account has been deleted', 410);
        }

        // Check if user is enrolled in course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                course: { activities: { some: { id: activityId } } },
                deletedAt: null
            }
        });

        if (!enrollment) {
            throw new ValidationException('Not enrolled in the course for this activity', 403);
        }

        // Check if submission already exists
        const existingSubmission = await submissionsRepository.findByActivityAndUser(activityId, userId);
        if (existingSubmission && !existingSubmission.deletedAt) {
            return existingSubmission;
        }

        // If previously deleted, restore
        if (existingSubmission && existingSubmission.deletedAt) {
            return submissionsRepository.update(existingSubmission.id, {
                status: 'DRAFT',
                deletedAt: null
            });
        }

        // Create new submission in DRAFT status
        return submissionsRepository.create({
            activityId,
            userId,
            status: 'DRAFT'
        });
    }

    /**
     * Update submission draft
     */
    async updateSubmission(id, data, userId, requestorRole) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only submission owner or admin
        if (requestorRole !== 'ADMIN' && submission.userId !== userId) {
            throw new ValidationException('You can only edit your own submission', 403);
        }

        // Can only edit draft submissions
        if (submission.status !== 'DRAFT') {
            throw new ValidationException(`Cannot edit ${submission.status} submission`, 400);
        }

        return submissionsRepository.update(id, data);
    }

    /**
     * Submit assignment
     */
    async submitAssignment(id, userId, requestorRole) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only submission owner or admin
        if (requestorRole !== 'ADMIN' && submission.userId !== userId) {
            throw new ValidationException('You can only submit your own assignment', 403);
        }

        // Can only submit draft submissions
        if (submission.status !== 'DRAFT') {
            throw new ValidationException(`Cannot submit ${submission.status} submission`, 400);
        }

        // Check if submission has content
        if (!submission.submissionContent) {
            throw new ValidationException('Cannot submit empty submission', 400);
        }

        // Check deadline and set late flag if needed
        const assignment = await prisma.assignment.findUnique({
            where: { activityId: submission.activityId },
            select: { submissionDeadline: true, lateSubmissionAllowed: true, daysAfterDeadline: true }
        });

        let isLate = false;
        if (assignment && new Date() > assignment.submissionDeadline) {
            if (!assignment.lateSubmissionAllowed) {
                throw new ValidationException('Submission deadline has passed', 400);
            }

            // Check if within late submission window
            if (assignment.daysAfterDeadline) {
                const deadline = new Date(assignment.submissionDeadline);
                const lateDeadline = new Date(deadline.getTime() + assignment.daysAfterDeadline * 24 * 60 * 60 * 1000);
                if (new Date() > lateDeadline) {
                    throw new ValidationException('Late submission window has closed', 400);
                }
            }

            isLate = true;
        }

        return submissionsRepository.submit(id, isLate);
    }

    /**
     * Grade submission
     */
    async gradeSubmission(id, score, feedback, requestorId, requestorRole) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only course instructor or admin
        if (requestorRole !== 'ADMIN' && submission.activity.course?.lecturerId !== requestorId) {
            throw new ValidationException('Only instructors can grade submissions', 403);
        }

        // Can only grade submitted or returned submissions
        if (!['SUBMITTED', 'RETURNED'].includes(submission.status)) {
            throw new ValidationException(`Cannot grade ${submission.status} submission`, 400);
        }

        // Validate score
        if (score < 0) {
            throw new ValidationException('Score cannot be negative', 400);
        }

        // Get activity points max
        const activity = await prisma.learningActivity.findUnique({
            where: { id: submission.activityId },
            select: { points: true }
        });

        if (activity && score > activity.points) {
            throw new ValidationException(`Score cannot exceed ${activity.points}`, 400);
        }

        return submissionsRepository.grade(id, score, feedback);
    }

    /**
     * Batch grade multiple submissions
     */
    async batchGrade(activityId, grades, requestorId, requestorRole) {
        // Verify activity exists and authorize
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } }, points: true }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        // Authorization check
        if (requestorRole !== 'ADMIN' && activity.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can grade submissions', 403);
        }

        // Grade each submission
        const results = await Promise.all(
            grades.map(({ submissionId, score, feedback }) =>
                this.gradeSubmission(submissionId, score, feedback, requestorId, requestorRole)
                    .catch(error => ({ error: error.message, submissionId }))
            )
        );

        return {
            successful: results.filter(r => !r.error),
            failed: results.filter(r => r.error)
        };
    }

    /**
     * Return submission for revision
     */
    async returnForRevision(id, feedback, requestorId, requestorRole) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only instructor or admin
        if (requestorRole !== 'ADMIN' && submission.activity.course?.lecturerId !== requestorId) {
            throw new ValidationException('Only instructors can return submissions', 403);
        }

        // Can return graded or submitted submissions
        if (!['GRADED', 'SUBMITTED'].includes(submission.status)) {
            throw new ValidationException(`Cannot return ${submission.status} submission`, 400);
        }

        return submissionsRepository.returnForRevision(id, feedback);
    }

    /**
     * Delete submission
     */
    async deleteSubmission(id, requestorId, requestorRole) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: submission owner or instructor or admin
        const isOwner = submission.userId === requestorId;
        const isInstructor = submission.activity.course?.lecturerId === requestorId;
        const isAdmin = requestorRole === 'ADMIN';

        if (!isOwner && !isInstructor && !isAdmin) {
            throw new ValidationException('Not authorized to delete this submission', 403);
        }

        return submissionsRepository.delete(id);
    }

    /**
     * Get activity submission statistics
     */
    async getActivityStatistics(activityId, requestorId, requestorRole) {
        // Verify activity exists and authorize
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        if (requestorRole !== 'ADMIN' && activity.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can view statistics', 403);
        }

        return submissionsRepository.getActivityStats(activityId);
    }

    /**
     * Get user submission statistics
     */
    async getUserStatistics(userId) {
        return submissionsRepository.getUserStats(userId);
    }

    /**
     * Get late submissions for activity
     */
    async getLateSubmissions(activityId, requestorId, requestorRole) {
        // Verify activity and authorize
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        if (requestorRole !== 'ADMIN' && activity.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can view late submissions', 403);
        }

        return submissionsRepository.getLateSubmissions(activityId);
    }

    /**
     * Get ungraded submissions for activity
     */
    async getUngradedSubmissions(activityId, requestorId, requestorRole) {
        // Verify activity and authorize
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } } }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        if (requestorRole !== 'ADMIN' && activity.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can view ungraded submissions', 403);
        }

        return submissionsRepository.getUngradedSubmissions(activityId);
    }
}

module.exports = new SubmissionsService();
