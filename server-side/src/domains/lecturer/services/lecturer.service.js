/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

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
     * @DESC: Retrieve lecturer profile by ID
     * @Params: id (string) - Lecturer CUID/UUID
     * @Returns: Lecturer object with all profile data
     * @throws: ValidationException if lecturer not found
     */
    async getLecturerById(id) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturer;
    }

    /**
     * @DESC: Retrieve lecturer profile by associated user ID
     * @Params: userId (string) - User CUID/UUID
     * @Returns: Lecturer object with profile details
     * @throws: ValidationException if profile not found for user
     */
    async getLecturerByUserId(userId) {
        const lecturer = await lecturerRepository.findByUserId(userId);

        if (!lecturer) {
            throw new ValidationException('Lecturer profile not found for this user');
        }

        return lecturer;
    }

    /**
     * @DESC: Retrieve all lecturers with pagination
     * @Params: pagination (object) - { page, limit }
     * @Returns: Paginated list of lecturers with metadata
     * @throws: ValidationException on invalid pagination params
     */
    async getAllLecturers(pagination) {
        return lecturerRepository.findAll(pagination);
    }

    /**
     * @DESC: Create a new lecturer profile for a user
     * @Params: data (object) - validated LecturerCreateDTO { userId, department, qualification, yearsExperience, specialization }
     * @Returns: Newly created Lecturer object
     * @throws: ValidationException if user not found or profile already exists
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
     * @DESC: Update an existing lecturer profile
     * @Params: id (string) - Lecturer CUID/UUID, data (object) - validated LecturerUpdateDTO (partial fields)
     * @Returns: Updated Lecturer object
     * @throws: ValidationException if lecturer not found
     */
    async updateLecturerProfile(id, data) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.update(id, data);
    }

    /**
     * @DESC: Soft delete a lecturer profile
     * @Params: id (string) - Lecturer CUID/UUID
     * @Returns: Deleted Lecturer object (soft deleted, deletedAt timestamp set)
     * @throws: ValidationException if lecturer not found
     */
    async deleteLecturerProfile(id) {
        const lecturer = await lecturerRepository.findById(id);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.delete(id);
    }

    /**
     * @DESC: Retrieve all courses taught by a lecturer
     * @Params: lecturerId (string) - Lecturer CUID/UUID, pagination (object) - { page, limit }
     * @Returns: Paginated list of courses with lecturer metadata
     * @throws: ValidationException if lecturer not found
     */
    async getLecturerCourses(lecturerId, pagination) {
        const lecturer = await lecturerRepository.findById(lecturerId);

        if (!lecturer) {
            throw new ValidationException('Lecturer not found');
        }

        return lecturerRepository.findCourses(lecturerId, pagination);
    }

    /**
     * @DESC: Retrieve lecturer performance and activity statistics
     * @Params: lecturerId (string) - Lecturer CUID/UUID
     * @Returns: Statistics object { coursesCount, studentsCount, averageRating, activitiesCount }
     * @throws: ValidationException if lecturer not found
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

