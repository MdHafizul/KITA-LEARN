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
    async bulkEnroll(courseId, userIds, requestorId, requestorRole) {
        // Verify course exists and requester is authorized (lecturer OR admin)
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, lecturerId: true, status: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        if (requestorRole !== 'ADMIN' && course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructors can bulk enroll students', 403);
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
    async updateEnrollment(id, data, requestorId, requestorRole) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: owner of enrollment OR admin
        if (requestorRole !== 'ADMIN' && enrollment.userId !== requestorId) {
            throw new ValidationException('You can only update your own enrollment', 403);
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
    async suspendEnrollment(id, requestorId, requestorRole) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: course lecturer OR admin
        if (requestorRole !== 'ADMIN' && enrollment.course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructor can suspend enrollment', 403);
        }

        return enrollmentRepository.updateStatus(id, 'SUSPENDED');
    }

    /**
     * Complete enrollment
     */
    async completeEnrollment(id, requestorId, requestorRole) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: course lecturer, student, OR admin
        const isStudent = enrollment.userId === requestorId;
        const isLecturer = enrollment.course?.lecturerId === requestorId;
        const isAdmin = requestorRole === 'ADMIN';

        if (!isStudent && !isLecturer && !isAdmin) {
            throw new ValidationException('Not authorized to complete this enrollment', 403);
        }

        return enrollmentRepository.updateStatus(id, 'COMPLETED');
    }

    /**
     * Drop enrollment
     */
    async dropEnrollment(id, requestorId, requestorRole) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: student OR admin
        if (requestorRole !== 'ADMIN' && enrollment.userId !== requestorId) {
            throw new ValidationException('Only students can drop their own enrollment', 403);
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
    async deleteEnrollment(id, requestorId, requestorRole) {
        const enrollment = await enrollmentRepository.findById(id);

        if (!enrollment) {
            throw new ValidationException('Enrollment not found', 404);
        }

        // Authorization: admin OR course lecturer
        const isLecturer = enrollment.course?.lecturerId === requestorId;
        const isAdmin = requestorRole === 'ADMIN';

        if (!isLecturer && !isAdmin) {
            throw new ValidationException('Only course instructor or admin can delete enrollment', 403);
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
    async getCourseStatistics(courseId, requestorId, requestorRole) {
        // Verify course exists and requester is authorized
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, lecturerId: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 404);
        }

        if (requestorRole !== 'ADMIN' && course.lecturerId !== requestorId) {
            throw new ValidationException('Only course instructor can view statistics', 403);
        }

        return enrollmentRepository.getCourseStat(courseId);
    }

    /**
     * Get user active enrollment count
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
