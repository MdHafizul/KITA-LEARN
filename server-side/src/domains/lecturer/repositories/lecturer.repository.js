/**
 * Lecturer Repository
 * Prisma data access layer for LecturerProfile model
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class LecturerRepository {
    /**
     * Find lecturer profile by ID
     */
    async findById(id) {
        return prisma.lecturerProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true
                    }
                },
                courses: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    /**
     * Find lecturer profile by user ID
     */
    async findByUserId(userId) {
        return prisma.lecturerProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true
                    }
                },
                courses: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    /**
     * Get all active lecturer profiles with pagination
     */
    async findAll({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const lecturers = await prisma.lecturerProfile.findMany({
            where: { deletedAt: null, isActive: true },
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true
                    }
                },
                courses: {
                    where: { deletedAt: null },
                    select: { id: true, title: true, status: true, enrollmentCount: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.lecturerProfile.count({
            where: { deletedAt: null, isActive: true }
        });

        return { lecturers, total, page, limit };
    }

    /**
     * Create lecturer profile
     */
    async create(data) {
        return prisma.lecturerProfile.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true
                    }
                }
            }
        });
    }

    /**
     * Update lecturer profile
     */
    async update(id, data) {
        return prisma.lecturerProfile.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true
                    }
                }
            }
        });
    }

    /**
     * Soft delete lecturer profile
     */
    async delete(id) {
        return prisma.lecturerProfile.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get lecturer's courses
     */
    async findCourses(lecturerId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const courses = await prisma.course.findMany({
            where: { lecturerId, deletedAt: null },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.course.count({
            where: { lecturerId, deletedAt: null }
        });

        return { courses, total, page, limit };
    }

    /**
     * Get lecturer statistics
     */
    async getStats(lecturerId) {
        const lecturer = await prisma.lecturerProfile.findUnique({
            where: { id: lecturerId }
        });

        if (!lecturer) return null;

        const courses = await prisma.course.count({
            where: { lecturerId, deletedAt: null }
        });

        const students = await prisma.enrollment.count({
            where: {
                course: { lecturerId },
                deletedAt: null
            }
        });

        return {
            totalCourses: courses,
            totalStudents: students,
            averageRating: lecturer.studentRatings || 0,
            totalPublications: lecturer.publicationsCount || 0
        };
    }
}

module.exports = new LecturerRepository();
