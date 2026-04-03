/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateSubmission(id, data, actor, isAdminBypass = false) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only submission owner or admin
        if (!isAdminBypass && submission.userId !== actor.id) {
            const error = new Error('You can only edit your own submission');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async submitAssignment(id, actor, isAdminBypass = false) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Authorization: only submission owner or admin
        if (!isAdminBypass && submission.userId !== actor.id) {
            const error = new Error('You can only submit your own assignment');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async gradeSubmission(id, score, feedback, actor, isAdminBypass = false) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        // Authorization: only course instructor or admin
        if (!isAdminBypass && (!lecturerProfile || submission.activity.course?.lecturerId !== lecturerProfile.id)) {
            const error = new Error('Only instructors can grade submissions');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async batchGrade(activityId, grades, actor, isAdminBypass = false) {
        // Verify activity exists and authorize
        const activity = await prisma.learningActivity.findUnique({
            where: { id: activityId },
            include: { course: { select: { lecturerId: true } }, points: true }
        });

        if (!activity) {
            throw new ValidationException('Activity not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        // Authorization check
        if (!isAdminBypass && (!lecturerProfile || activity.course.lecturerId !== lecturerProfile.id)) {
            const error = new Error('Only course instructors can grade submissions');
            error.statusCode = 403;
            throw error;
        }

        // Grade each submission
        const results = await Promise.all(
            grades.map(({ submissionId, score, feedback }) =>
                this.gradeSubmission(submissionId, score, feedback, actor, isAdminBypass)
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async returnForRevision(id, feedback, actor, isAdminBypass = false) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        // Authorization: only instructor or admin
        if (!isAdminBypass && (!lecturerProfile || submission.activity.course?.lecturerId !== lecturerProfile.id)) {
            const error = new Error('Only instructors can return submissions');
            error.statusCode = 403;
            throw error;
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteSubmission(id, actor, isAdminBypass = false) {
        const submission = await submissionsRepository.findById(id);

        if (!submission) {
            throw new ValidationException('Submission not found', 404);
        }

        // Fetch LecturerProfile for instructor check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        // Authorization: submission owner or instructor or admin
        const isOwner = submission.userId === actor.id;
        const isInstructor = lecturerProfile && submission.activity.course?.lecturerId === lecturerProfile.id;
        const isAdmin = isAdminBypass;

        if (!isOwner && !isInstructor && !isAdmin) {
            throw new ValidationException('Not authorized to delete this submission', 403);
        }

        return submissionsRepository.delete(id);
    }

    /**
     * Get activity submission statistics
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
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

