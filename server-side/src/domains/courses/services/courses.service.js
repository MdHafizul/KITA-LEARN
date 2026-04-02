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
            isPublished: false
        };

        return coursesRepository.createCourse(courseData);
    }

    /**
     * Update course
     */
    async updateCourse(id, data, lecturerId) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Verify ownership
        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to update this course');
        }

        return coursesRepository.updateCourse(id, data);
    }

    /**
     * Delete course (soft delete)
     */
    async deleteCourse(id, lecturerId) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        // Verify ownership
        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to delete this course');
        }

        return coursesRepository.deleteCourse(id);
    }

    /**
     * Publish course
     */
    async publishCourse(id, lecturerId) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to publish this course');
        }

        return coursesRepository.updateCourse(id, { isPublished: true, status: 'PUBLISHED' });
    }

    /**
     * Archive course
     */
    async archiveCourse(id, lecturerId) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        if (course.lecturerId !== lecturerId) {
            throw new ValidationException('Not authorized to archive this course');
        }

        return coursesRepository.updateCourse(id, { status: 'ARCHIVED' });
    }

    /**
     * Add course prerequisite
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
    async getCourseStats(id) {
        const course = await coursesRepository.findCourseById(id);

        if (!course) {
            throw new ValidationException('Course not found');
        }

        return coursesRepository.getCourseStats(id);
    }
}

module.exports = new CoursesService();
