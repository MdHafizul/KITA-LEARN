/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Courses Service
 * Business logic for course operations
 */

const { ValidationException } = require('../../../exceptions');
const coursesRepository = require('../repositories/courses.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CoursesService {
    /**
     * Get course by ID
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getCourseById(id) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return course;
    }

    /**
     * Get all courses by lecturer
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getCoursesByLecturerId(lecturerId, pagination) {
        const lecturer = await prisma.lecturerProfile.findUnique({
            where: { id: lecturerId }
        });

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return coursesRepository.findCoursesByLecturerId(lecturerId, pagination);
    }

    /**
     * Get all published courses
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAllCourses(pagination) {
        return coursesRepository.findAll(pagination);
    }

    /**
     * Create course
     */
    async createCourse(data, lecturerId) {
        // Verify lecturer exists
        const lecturer = await prisma.lecturerProfile.findUnique({
            where: { id: lecturerId }
        });

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        const courseData = {
            ...data,
            lecturerId,
            enrollmentCount: 0,
            status: 'DRAFT'
        };

        return coursesRepository.createCourse(courseData);
    }

    /**
     * Update course
     * Admin Bypass Pattern: If isAdmin=true, skip ownership check
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateCourse(id, data, lecturerId, isAdmin = false) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Admin bypass: If not admin, verify ownership by comparing lecturer profile IDs
        if (!isAdmin && course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to update this course');
            error.statusCode = 403;
            throw error;
        }

        return coursesRepository.updateCourse(id, data);
    }

    /**
     * Delete course (soft delete)
     * Admin Bypass Pattern: If isAdmin=true, skip ownership check
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteCourse(id, lecturerId, isAdmin = false) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Admin bypass: If not admin, verify ownership by comparing lecturer profile IDs
        if (!isAdmin && lecturerId && course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to delete this course');
            error.statusCode = 403;
            throw error;
        }

        return coursesRepository.deleteCourse(id);
    }

    /**
     * Publish course
     * Admin Bypass Pattern: If isAdmin=true, skip ownership check
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async publishCourse(id, lecturerId, isAdmin = false) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Admin bypass: If not admin, verify ownership by comparing lecturer profile IDs
        if (!isAdmin && lecturerId && course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to publish this course');
            error.statusCode = 403;
            throw error;
        }

        return coursesRepository.updateCourse(id, { status: 'PUBLISHED' });
    }

    /**
     * Archive course
     * Admin Bypass Pattern: If isAdmin=true, skip ownership check
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async archiveCourse(id, lecturerId, isAdmin = false) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Admin bypass: If not admin, verify ownership by comparing lecturer profile IDs
        if (!isAdmin && lecturerId && course.lecturerId !== lecturerId) {
            const error = new Error('Not authorized to archive this course');
            error.statusCode = 403;
            throw error;
        }

        return coursesRepository.updateCourse(id, { status: 'ARCHIVED' });
    }

    /**
     * Add course prerequisite
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async addPrerequisite(courseId, prerequisiteCourseId, lecturerId) {
        const course = await coursesRepository.findCourseById(courseId);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to modify this course');
        }

        const prerequisiteCourse = await coursesRepository.findCourseById(prerequisiteCourseId);
        if (!prerequisiteCourse) {
            throw new ValidationException('Prerequisite course not found');
        }

        // Check if prerequisite already exists
        const existing = await prisma.coursePrerequisite.findUnique({
            where: {
                courseId_prerequisiteCourseId: {
                    courseId,
                    prerequisiteCourseId
                }
            }
        });

        if (existing && !existing.deletedAt) {
            throw new ValidationException('Prerequisite already exists');
        }

        return coursesRepository.createPrerequisite({
            courseId,
            prerequisiteCourseId
        });
    }

    /**
     * Get course prerequisites
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getPrerequisites(courseId) {
        const course = await coursesRepository.findCourseById(courseId);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return coursesRepository.getPrerequisites(courseId);
    }

    /**
     * Remove course prerequisite
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async removePrerequisite(id, lecturerId) {
        const prerequisite = await prisma.coursePrerequisite.findUnique({
            where: { id }
        });

        if (!prerequisite) {
            throw new ValidationException('Prerequisite not found');
        }

        const course = await coursesRepository.findCourseById(prerequisite.courseId);
        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized');
        }

        return coursesRepository.deletePrerequisite(id);
    }

    /**
     * Add course material
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async addMaterial(data, lecturerId) {
        const course = await coursesRepository.findCourseById(data.courseId);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to add materials to this course');
        }

        return coursesRepository.createMaterial(data);
    }

    /**
     * Get course materials
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getMaterials(courseId, pagination) {
        const course = await coursesRepository.findCourseById(courseId);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return coursesRepository.getMaterials(courseId, pagination);
    }

    /**
     * Update course material
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateMaterial(id, data, lecturerId) {
        const material = await prisma.courseMaterial.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!material) {
            throw new ValidationException('Material not found');
        }

        if (material.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this material');
        }

        return coursesRepository.updateMaterial(id, data);
    }

    /**
     * Delete course material
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteMaterial(id, lecturerId) {
        const material = await prisma.courseMaterial.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!material) {
            throw new ValidationException('Material not found');
        }

        if (material.course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this material');
        }

        return coursesRepository.deleteMaterial(id);
    }

    /**
     * Get course statistics
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getCourseStats(id) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return coursesRepository.getCourseStats(id);
    }
}

module.exports = new CoursesService();

