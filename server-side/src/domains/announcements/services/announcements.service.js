/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Announcements Service
 * Business logic for announcement operations
 */

const { ValidationException } = require('../../../exceptions');
const announcementsRepository = require('../repositories/announcements.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnnouncementsService {
    // ============================================
    // ANNOUNCEMENT OPERATIONS
    // ============================================

    /**
     * Get announcement by ID
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAnnouncementById(id) {
        const announcement = await announcementsRepository.findAnnouncementById(id);

        if (!announcement) {
            throw new ValidationException('Announcement not found', 'ANNOUNCEMENT_NOT_FOUND');
        }

        return announcement;
    }

    /**
     * Get announcements by course
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAnnouncementsByCourse(courseId, pagination) {
        return announcementsRepository.findAnnouncementsByCourse(courseId, pagination);
    }

    /**
     * Get active announcements by course (not expired)
     */
    async getActiveAnnouncementsByCourse(courseId, pagination) {
        return announcementsRepository.findActiveAnnouncementsByCourse(courseId, pagination);
    }

    /**
     * Get unread announcements for user
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getUnreadAnnouncementsForUser(courseId, userId, pagination) {
        return announcementsRepository.findUnreadAnnouncementsForUser(courseId, userId, pagination);
    }

    /**
     * Get unread count for user in course
     */
    async getUnreadCountForUser(courseId, userId) {
        return announcementsRepository.getUnreadCountForUser(courseId, userId);
    }

    /**
     * Get announcements by priority
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAnnouncementsByPriority(courseId, priority, pagination) {
        const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
        if (!validPriorities.includes(priority)) {
            throw new ValidationException(
                'Invalid priority level',
                'INVALID_PRIORITY'
            );
        }

        return announcementsRepository.findAnnouncementsByPriority(courseId, priority, pagination);
    }

    /**
     * Get announcements with filters
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAnnouncementsFiltered(filters, pagination) {
        return announcementsRepository.findAnnouncementsWithFilters(filters, pagination);
    }

    /**
     * Create announcement (lecturer only)
     */
    async createAnnouncement(data, lecturerId, isAdmin = false) {
        // Verify course exists and user is instructor
        const course = await prisma.course.findUnique({
            where: { id: data.courseId },
            select: { lecturerId: true, id: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 'COURSE_NOT_FOUND');
        }

        if (!isAdmin && course.lecturerId !== lecturerId) {
            const error = new Error('Only the course instructor can create announcements');
            error.statusCode = 403;
            throw error;
        }

        // Validate expiration date if provided
        if (data.expiresAt) {
            const expirationDate = new Date(data.expiresAt);
            if (expirationDate <= new Date()) {
                throw new ValidationException(
                    'Expiration date must be in the future',
                    'INVALID_EXPIRATION_DATE'
                );
            }
        }

        return announcementsRepository.createAnnouncement(data);
    }

    /**
     * Create announcements in bulk
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async createBulkAnnouncements(courseId, announcements, lecturerId, isAdmin = false) {
        // Verify course exists and user is instructor
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { lecturerId: true }
        });

        if (!course) {
            throw new ValidationException('Course not found', 'COURSE_NOT_FOUND');
        }

        if (!isAdmin && course.lecturerId !== lecturerId) {
            const error = new Error('Only the course instructor can create announcements');
            error.statusCode = 403;
            throw error;
        }

        // Validate all announcements
        announcements.forEach(ann => {
            if (ann.expiresAt) {
                const expirationDate = new Date(ann.expiresAt);
                if (expirationDate <= new Date()) {
                    throw new ValidationException(
                        `Expiration date must be in the future for announcement: ${ann.title}`,
                        'INVALID_EXPIRATION_DATE'
                    );
                }
            }
        });

        // Prepare data with courseId
        const announcementData = announcements.map(ann => ({
            ...ann,
            courseId
        }));

        return announcementsRepository.createBulkAnnouncements(announcementData);
    }

    /**
     * Update announcement
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async updateAnnouncement(id, data, lecturerId, isAdmin = false) {
        const announcement = await this.getAnnouncementById(id);

        // Verify authorization
        const course = await prisma.course.findUnique({
            where: { id: announcement.courseId },
            select: { lecturerId: true }
        });

        if (!isAdmin && course?.lecturerId !== lecturerId) {
            const error = new Error('Only the course instructor can update announcements');
            error.statusCode = 403;
            throw error;
        }

        // Validate expiration date if updating
        if (data.expiresAt) {
            const expirationDate = new Date(data.expiresAt);
            if (expirationDate <= new Date()) {
                throw new ValidationException(
                    'Expiration date must be in the future',
                    'INVALID_EXPIRATION_DATE'
                );
            }
        }

        return announcementsRepository.updateAnnouncement(id, data);
    }

    /**
     * Delete announcement
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async deleteAnnouncement(id, lecturerId, isAdmin = false) {
        const announcement = await this.getAnnouncementById(id);

        // Verify authorization
        const course = await prisma.course.findUnique({
            where: { id: announcement.courseId },
            select: { lecturerId: true }
        });

        if (!isAdmin && course?.lecturerId !== lecturerId) {
            const error = new Error('Only the course instructor can delete announcements');
            error.statusCode = 403;
            throw error;
        }

        return announcementsRepository.deleteAnnouncement(id);
    }

    /**
     * Mark announcement as read by user
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async markAsRead(announcementId, userId) {
        const announcement = await this.getAnnouncementById(announcementId);

        // Check if user is enrolled in course
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                courseId: announcement.courseId,
                userId,
                deletedAt: null
            }
        });

        if (!enrollment) {
            throw new ValidationException(
                'User must be enrolled in course to read announcements',
                'NOT_ENROLLED'
            );
        }

        // Get or create recipient record
        let recipient = await announcementsRepository.findRecipient(announcementId, userId);

        if (!recipient) {
            recipient = await announcementsRepository.createRecipient(announcementId, userId);
        }

        // Mark as read
        return announcementsRepository.markAsRead(announcementId, userId);
    }

    /**
     * Get read statistics for announcement
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getReadStatistics(announcementId, lecturerId) {
        const announcement = await this.getAnnouncementById(announcementId);

        // Verify authorization
        const course = await prisma.course.findUnique({
            where: { id: announcement.courseId },
            select: { lecturerId: true }
        });

        if (course?.lecturerId !== lecturerId) {
            throw new ValidationException(
                'Only the course instructor can view announcement statistics',
                'UNAUTHORIZED_ACCESS'
            );
        }

        return announcementsRepository.getReadStatistics(announcementId);
    }

    /**
     * Broadcast announcement to all enrolled students
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async broadcastAnnouncement(announcementId, lecturerId) {
        const announcement = await this.getAnnouncementById(announcementId);

        // Verify authorization
        const course = await prisma.course.findUnique({
            where: { id: announcement.courseId },
            select: { lecturerId: true }
        });

        if (course?.lecturerId !== lecturerId) {
            throw new ValidationException(
                'Only the course instructor can broadcast announcements',
                'UNAUTHORIZED_BROADCAST'
            );
        }

        // Get all enrolled students
        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseId: announcement.courseId,
                status: 'ACTIVE',
                deletedAt: null
            },
            select: { userId: true }
        });

        // Create recipient records for all students
        const recipientData = enrollments.map(e => ({
            announcementId,
            userId: e.userId
        }));

        return announcementsRepository.createBulkRecipients(recipientData);
    }

    /**
     * Get announcements for user dashboard
     */
    /**
     * Desc: Service function executes domain business logic and repository orchestration.
     * Params: Accept explicit method arguments passed from controller or internal callers.
     * Body: N/A at service layer; consume already validated payload objects.
     * Auth Headers: N/A at service layer; authorization is handled before service invocation.
     */
    async getAnnouncementsForUserDashboard(userId, { page = 1, limit = 10 }) {
        // Get courses user is enrolled in
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId,
                status: { in: ['ACTIVE', 'COMPLETED'] },
                deletedAt: null
            },
            select: { courseId: true }
        });

        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) {
            return { items: [], total: 0, page, limit };
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where: {
                    courseId: { in: courseIds },
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                },
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        where: { userId },
                        select: { readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({
                where: {
                    courseId: { in: courseIds },
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                }
            })
        ]);

        return { items, total, page, limit };
    }
}

module.exports = new AnnouncementsService();

