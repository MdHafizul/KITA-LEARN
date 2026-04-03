/**
 * Courses Repository
 * Prisma data access layer for Course, CoursePrerequisite, CourseMaterial models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CoursesRepository {
    /**
     * Find course by ID
     */
    async findCourseById(id) {
        return prisma.course.findUnique({
            where: { id },
            include: {
                lecturer: {
                    select: {
                        id: true,
                        userId: true,
                        qualifications: true,
                        specialization: true
                    }
                },
                prerequisites: true,
                materials: {
                    where: { deletedAt: null },
                    orderBy: { displayOrder: 'asc' }
                },
                enrollments: {
                    where: { deletedAt: null }
                }
            }
        });
    }

    /**
     * Find courses by lecturer ID
     */
    async findCoursesByLecturerId(lecturerId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const courses = await prisma.course.findMany({
            where: { lecturerId, deletedAt: null },
            skip,
            take: limit,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        userId: true,
                        qualifications: true,
                        specialization: true
                    }
                },
                materials: {
                    where: { deletedAt: null },
                    select: { id: true, title: true, materialType: true }
                },
                enrollments: {
                    where: { deletedAt: null },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.course.count({
            where: { lecturerId, deletedAt: null }
        });

        return { courses, total, page, limit };
    }

    /**
     * Get all published courses with pagination
     */
    async findAll({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const courses = await prisma.course.findMany({
            where: { deletedAt: null, status: 'PUBLISHED', isActive: true },
            skip,
            take: limit,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        userId: true,
                        qualifications: true,
                        specialization: true
                    }
                },
                materials: {
                    where: { deletedAt: null },
                    select: { id: true, title: true }
                },
                enrollments: {
                    where: { deletedAt: null },
                    select: { id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.course.count({
            where: { deletedAt: null, status: 'PUBLISHED', isActive: true }
        });

        return { courses, total, page, limit };
    }

    /**
     * Create course
     */
    async createCourse(data) {
        return prisma.course.create({
            data,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        userId: true,
                        qualifications: true,
                        specialization: true
                    }
                }
            }
        });
    }

    /**
     * Update course
     */
    async updateCourse(id, data) {
        return prisma.course.update({
            where: { id },
            data,
            include: {
                lecturer: {
                    select: {
                        id: true,
                        userId: true,
                        qualifications: true,
                        specialization: true
                    }
                },
                materials: {
                    where: { deletedAt: null }
                },
                enrollments: {
                    where: { deletedAt: null }
                }
            }
        });
    }

    /**
     * Soft delete course
     */
    async deleteCourse(id) {
        return prisma.course.update({
            where: { id },
            data: { deletedAt: new Date() },
            include: {
                lecturer: true
            }
        });
    }

    /**
     * Create course prerequisite
     */
    async createPrerequisite(data) {
        return prisma.coursePrerequisite.create({
            data,
            include: {
                course: { select: { id: true, title: true } },
                prerequisiteCourse: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Get course prerequisites
     */
    async getPrerequisites(courseId) {
        return prisma.coursePrerequisite.findMany({
            where: { courseId, deletedAt: null },
            include: {
                prerequisiteCourse: true
            }
        });
    }

    /**
     * Delete course prerequisite
     */
    async deletePrerequisite(id) {
        return prisma.coursePrerequisite.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Create course material
     */
    async createMaterial(data) {
        return prisma.courseMaterial.create({
            data,
            include: {
                course: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Get course materials
     */
    async getMaterials(courseId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;

        const materials = await prisma.courseMaterial.findMany({
            where: { courseId, deletedAt: null },
            skip,
            take: limit,
            orderBy: { displayOrder: 'asc' }
        });

        const total = await prisma.courseMaterial.count({
            where: { courseId, deletedAt: null }
        });

        return { materials, total, page, limit };
    }

    /**
     * Update course material
     */
    async updateMaterial(id, data) {
        return prisma.courseMaterial.update({
            where: { id },
            data,
            include: {
                course: { select: { id: true, title: true } }
            }
        });
    }

    /**
     * Delete course material
     */
    async deleteMaterial(id) {
        return prisma.courseMaterial.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get course statistics
     */
    async getCourseStats(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) return null;

        const enrollmentCount = await prisma.enrollment.count({
            where: { courseId, deletedAt: null }
        });

        const materialsCount = await prisma.courseMaterial.count({
            where: { courseId, deletedAt: null }
        });

        const activitiesCount = await prisma.learningActivity.count({
            where: { courseId, deletedAt: null }
        });

        return {
            courseId,
            enrollmentCount,
            materialsCount,
            activitiesCount,
            lastUpdated: course.updatedAt
        };
    }
}

module.exports = new CoursesRepository();
