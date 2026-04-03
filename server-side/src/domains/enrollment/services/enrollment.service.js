/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Enrollment Service
 * Business logic for course enrollment operations
 */

const { ValidationException } = require('../../../exceptions');
const enrollmentRepository = require('../repositories/enrollment.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class EnrollmentService {
    /**
     * Get enrollment by ID
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getEnrollmentById(id) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        return enrollment;
    }

    /**
     * Get enrollments for a course (course owner only)
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getEnrollmentsByCourse(courseId, pagination, requestorId, requestorRole) {
        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, lecturerId: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        // Check authorization (lecturer OR admin)
        if (requestorRole !== 'ADMIN' && course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can view enrollments', 403);
        }

        return enrollmentRepository.findByCourse(courseId, pagination);
    }

    /**
     * Get enrollments for a student
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getEnrollmentsByUser(userId, pagination) {
        return enrollmentRepository.findByUser(userId, pagination);
    }

    /**
     * Get enrollments with filters
     */
    async getEnrollmentsFiltered(filters, pagination) {
        return enrollmentRepository.findWithFilters(filters, pagination);
    }

    /**
     * Enroll student in course
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async enrollUser(courseId, userId) {
        // Verify course exists and is published (students can only enroll in published courses)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, status: true, maxStudents: true, enrollmentCount: true, deletedAt: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        if (course.deletedAt) {
            throw new ValidationException('Course has been deleted', 410);
        }

        if (course.status !== 'PUBLISHED') {
            throw new ValidationException('Course is not available for enrollment', 400);
        }

        // Check capacity
        if (course.maxStudents && course.enrollmentCount >= course.maxStudents) {
            throw new ValidationException('Course is full', 400);
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

        // Check if already enrolled
        const existingEnrollment = await enrollmentRepository.findByCourseAndUser(courseId, userId);
        if (existingEnrollment && !existingEnrollment.deletedAt) {
            throw new ValidationException('Student is already enrolled in this course', 400);
        }

        // If previously soft-deleted, restore
        if (existingEnrollment && existingEnrollment.deletedAt) {
            return enrollmentRepository.update(existingEnrollment.id, {
                status: 'ACTIVE',
                deletedAt: null,
                enrollmentDate: new Date()
            });
        }

        // Create new enrollment
        const enrollment = await enrollmentRepository.create({
            courseId,
            userId,
            status: 'ACTIVE'
        });

        // Update course enrollment count
        await prisma.course.update({
            where: { id: courseId },
            data: { enrollmentCount: { increment: 1 } }
        });

        return enrollment;
    }

    /**
     * Bulk enroll students in course
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async bulkEnroll(courseId, userIds, actor, isAdminBypass = false) {
        // Verify course exists and requester is authorized (lecturer OR admin)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, lecturerId: true, status: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        if (!lecturerProfile) {
            throw new ValidationException('Lecturer profile not found', 404);
        }

        if (!isAdminBypass && course.lecturerId !== lecturerProfile.id) {
            const error = new Error('Only course instructors can bulk enroll students');
            error.statusCode = 403;
            throw error;
        }

        // Enroll users
        const enrollments = await enrollmentRepository.createBulk(courseId, userIds);

        // Update course enrollment count
        await prisma.course.update({
            where: { id: courseId },
            data: { enrollmentCount: { increment: enrollments.length } }
        });

        return enrollments;
    }

    /**
     * Update enrollment (student progress, status)
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateEnrollment(id, data, actor, isAdminBypass = false) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: owner of enrollment OR admin
        if (!isAdminBypass && enrollment.userId !== actor.id) {
            const error = new Error('You can only update your own enrollment');
            error.statusCode = 403;
            throw error;
        }

        // Validate status transitions if changing status
        if (data.status && data.status !== enrollment.status) {
            const validTransitions = {
                'ACTIVE': ['SUSPENDED', 'COMPLETED', 'DROPPED'],
                'SUSPENDED': ['ACTIVE', 'DROPPED'],
                'COMPLETED': [],
                'DROPPED': []
            };

            if (!validTransitions[enrollment.status].includes(data.status)) {
                throw new ValidationException(
                    `Cannot transition from ${enrollment.status} to ${data.status}`,
                    400
                );
            }
        }

        return enrollmentRepository.update(id, data);
    }

    /**
     * Update enrollment progress
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateProgress(id, progressPercent, requestorId) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: only system/service can update progress
        if (progressPercent < 0 || progressPercent > 100) {
            throw new ValidationException('Progress must be between 0 and 100', 400);
        }

        return enrollmentRepository.updateProgress(id, progressPercent);
    }

    /**
     * Suspend enrollment (lecturer action)
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async suspendEnrollment(id, actor, isAdminBypass = false) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        if (!lecturerProfile) {
            throw new ValidationException('Lecturer profile not found', 404);
        }

        // Authorization: course lecturer OR admin
        if (!isAdminBypass && enrollment.course.lecturerId !== lecturerProfile.id) {
            const error = new Error('Only course instructor can suspend enrollment');
            error.statusCode = 403;
            throw error;
        }

        return enrollmentRepository.updateStatus(id, 'SUSPENDED');
    }

    /**
     * Complete enrollment
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async completeEnrollment(id, actor, isAdminBypass = false) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: course lecturer, student, OR admin
        const isStudent = enrollment.userId === actor.id;
        const isAdmin = isAdminBypass;

        if (!isStudent && !isAdmin) {
            // Check if actor is the course lecturer
            const lecturerProfile = await prisma.lecturerProfile.findUnique({
                where: { userId: actor.id }
            });
            const isLecturer = lecturerProfile && enrollment.course?.lecturerId === lecturerProfile.id;

            if (!isLecturer) {
                const error = new Error('Not authorized to complete this enrollment');
                error.statusCode = 403;
                throw error;
            }
        }

        return enrollmentRepository.updateStatus(id, 'COMPLETED');
    }

    /**
     * Drop enrollment
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async dropEnrollment(id, actor, isAdminBypass = false) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: student OR admin
        if (!isAdminBypass && enrollment.userId !== actor.id) {
            const error = new Error('Only students can drop their own enrollment');
            error.statusCode = 403;
            throw error;
        }

        const updated = await enrollmentRepository.updateStatus(id, 'DROPPED');

        // Decrement course enrollment count only if previously active
        if (enrollment.status === 'ACTIVE') {
            await prisma.course.update({
                where: { id: enrollment.courseId },
                data: { enrollmentCount: { decrement: 1 } }
            });
        }

        return updated;
    }

    /**
     * Delete enrollment (soft delete)
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteEnrollment(id, actor, isAdminBypass = false) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        if (!lecturerProfile) {
            throw new ValidationException('Lecturer profile not found', 404);
        }

        // Authorization: admin OR course lecturer
        if (!isAdminBypass && enrollment.course?.lecturerId !== lecturerProfile.id) {
            const error = new Error('Only course instructor or admin can delete enrollment');
            error.statusCode = 403;
            throw error;
        }

        // Decrement course count if active
        if (enrollment.status === 'ACTIVE') {
            await prisma.course.update({
                where: { id: enrollment.courseId },
                data: { enrollmentCount: { decrement: 1 } }
            });
        }

        return enrollmentRepository.delete(id);
    }

    /**
     * Get course enrollment statistics
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getCourseStatistics(courseId, actor, isAdminBypass = false) {
        // Verify course exists and requester is authorized
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, lecturerId: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        // Fetch LecturerProfile for ownership check
        const lecturerProfile = await prisma.lecturerProfile.findUnique({
            where: { userId: actor.id }
        });

        if (!isAdminBypass && (!lecturerProfile || course.lecturerId !== lecturerProfile.id)) {
            const error = new Error('Only course instructor can view statistics');
            error.statusCode = 403;
            throw error;
        }

        return enrollmentRepository.getCourseStat(courseId);
    }

    /**
     * Get user active enrollment count
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getUserEnrollmentCount(userId) {
        return enrollmentRepository.getUserEnrollmentCount(userId);
    }

    /**
     * Check if user is enrolled in course
     */
    async isEnrolled(courseId, userId) {
        return enrollmentRepository.isEnrolled(courseId, userId);
    }
}

module.exports = new EnrollmentService();

