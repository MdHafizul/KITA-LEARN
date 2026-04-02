/**
 * Lecturer Service
 * Business logic for lecturer operations
 */

const { ValidationException } = require('../../../exceptions');
const lecturerRepository = require('../repositories/lecturer.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class LecturerService {
    /**
     * Get lecturer profile by ID
     */
    async getLecturerById(id) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturer;
    }

    /**
     * Get lecturer profile by user ID
     */
    async getLecturerByUserId(userId) {
        const lecturer = await lecturerRepository.findByUserId(userId);

        if (!lecturer) {
            throw new ValidationException('Lecturer profile not found for this user');
        }

        return lecturer;
    }

    /**
     * Get all lecturers with pagination
     */
    async getAllLecturers(pagination) {
        return lecturerRepository.findAll(pagination);
    }

    /**
     * Create lecturer profile
     */
    async createLecturerProfile(data) {
        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: data.userId }
        });

        if (!user) {
            throw new ValidationException('User not found');
        }

        // Check if profile already exists
        const existing = await lecturerRepository.findByUserId(data.userId);
        if (existing) {
            throw new ValidationException('Lecturer profile already exists for this user');
        }

        return lecturerRepository.create(data);
    }

    /**
     * Update lecturer profile
     */
    async updateLecturerProfile(id, data) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.update(id, data);
    }

    /**
     * Delete lecturer profile (soft delete)
     */
    async deleteLecturerProfile(id) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.delete(id);
    }

    /**
     * Get lecturer's courses
     */
    async getLecturerCourses(lecturerId, pagination) {
        const lecturer = await lecturerRepository.findById(lecturerId);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.findCourses(lecturerId, pagination);
    }

    /**
     * Get lecturer statistics
     */
    async getLecturerStats(lecturerId) {
        const lecturer = await lecturerRepository.findById(lecturerId);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.getStats(lecturerId);
    }
}

module.exports = new LecturerService();
