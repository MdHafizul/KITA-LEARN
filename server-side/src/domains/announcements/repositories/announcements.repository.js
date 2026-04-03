/**
 * Announcements Repository
 * Prisma data access layer for Announcement and AnnouncementRecipient models
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnnouncementsRepository {
    // ============================================
    // ANNOUNCEMENT QUERIES
    // ============================================

    /**
     * Find announcement by ID
     */
    async findAnnouncementById(id) {
        return prisma.announcement.findUnique({
            where: { id },
            include: {
                course: {
                    select: { id: true, title: true }
                },
                recipients: {
                    select: { id: true, userId: true, readAt: true }
                }
            }
        });
    }

    /**
     * Get announcements by course with pagination
     */
    async findAnnouncementsByCourse(courseId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where: { courseId, deletedAt: null },
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        select: { id: true, userId: true, readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({
                where: { courseId, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get active announcements by course (not expired)
     */
    async findActiveAnnouncementsByCourse(courseId, { page = 1, limit = 10 }) {
        const now = new Date();
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where: {
                    courseId,
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } }
                    ]
                },
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        select: { id: true, userId: true, readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({
                where: {
                    courseId,
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } }
                    ]
                }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get announcements by priority
     */
    async findAnnouncementsByPriority(courseId, priority, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where: { courseId, priority, deletedAt: null },
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        select: { id: true, userId: true, readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({
                where: { courseId, priority, deletedAt: null }
            })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Get announcements with filters
     */
    async findAnnouncementsWithFilters(filters, { page = 1, limit = 10 }) {
        const where = {
            deletedAt: null,
            ...(filters.courseId && { courseId: filters.courseId }),
            ...(filters.priority && { priority: filters.priority })
        };

        // Handle expired filter
        if (filters.isExpired !== undefined) {
            const now = new Date();
            if (filters.isExpired) {
                where.AND = [
                    { expiresAt: { not: null } },
                    { expiresAt: { lte: now } }
                ];
            } else {
                where.OR = [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ];
            }
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where,
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        select: { id: true, userId: true, readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({ where })
        ]);

        return { items, total, page, limit };
    }

    /**
     * Create announcement
     */
    async createAnnouncement(data) {
        return prisma.announcement.create({
            data,
            include: {
                course: {
                    select: { id: true, title: true }
                },
                recipients: {
                    select: { id: true, userId: true, readAt: true }
                }
            }
        });
    }

    /**
     * Create multiple announcements (bulk)
     */
    async createBulkAnnouncements(data) {
        return prisma.announcement.createMany({
            data,
            skipDuplicates: true
        });
    }

    /**
     * Update announcement
     */
    async updateAnnouncement(id, data) {
        return prisma.announcement.update({
            where: { id },
            data,
            include: {
                course: {
                    select: { id: true, title: true }
                },
                recipients: {
                    select: { id: true, userId: true, readAt: true }
                }
            }
        });
    }

    /**
     * Soft delete announcement
     */
    async deleteAnnouncement(id) {
        return prisma.announcement.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    /**
     * Get unread announcement count for user in course
     */
    async getUnreadCountForUser(courseId, userId) {
        return prisma.announcement.count({
            where: {
                courseId,
                deletedAt: null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ],
                recipients: {
                    some: {
                        userId,
                        readAt: null
                    }
                }
            }
        });
    }

    /**
     * Get unread announcements for user in course
     */
    async findUnreadAnnouncementsForUser(courseId, userId, { page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.announcement.findMany({
                where: {
                    courseId,
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ],
                    recipients: {
                        some: {
                            userId,
                            readAt: null
                        }
                    }
                },
                include: {
                    course: {
                        select: { id: true, title: true }
                    },
                    recipients: {
                        select: { id: true, userId: true, readAt: true }
                    }
                },
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' }
            }),
            prisma.announcement.count({
                where: {
                    courseId,
                    deletedAt: null,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ],
                    recipients: {
                        some: {
                            userId,
                            readAt: null
                        }
                    }
                }
            })
        ]);

        return { items, total, page, limit };
    }

    // ============================================
    // ANNOUNCEMENT RECIPIENT QUERIES
    // ============================================

    /**
     * Find recipient record
     */
    async findRecipient(announcementId, userId) {
        return prisma.announcementRecipient.findUnique({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId
                }
            }
        });
    }

    /**
     * Create recipient record (user receives announcement)
     */
    async createRecipient(announcementId, userId) {
        return prisma.announcementRecipient.create({
            data: {
                announcementId,
                userId
            }
        });
    }

    /**
     * Create multiple recipients (bulk)
     */
    async createBulkRecipients(data) {
        return prisma.announcementRecipient.createMany({
            data,
            skipDuplicates: true
        });
    }

    /**
     * Mark announcement as read for user
     */
    async markAsRead(announcementId, userId) {
        return prisma.announcementRecipient.update({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId
                }
            },
            data: { readAt: new Date() }
        });
    }

    /**
     * Get read count for announcement
     */
    async getReadCount(announcementId) {
        return prisma.announcementRecipient.count({
            where: {
                announcementId,
                readAt: { not: null }
            }
        });
    }

    /**
     * Get recipient count for announcement
     */
    async getRecipientCount(announcementId) {
        return prisma.announcementRecipient.count({
            where: { announcementId }
        });
    }

    /**
     * Get read statistics for announcement
     */
    async getReadStatistics(announcementId) {
        const [total, read] = await Promise.all([
            this.getRecipientCount(announcementId),
            this.getReadCount(announcementId)
        ]);

        return {
            totalRecipients: total,
            readCount: read,
            unreadCount: total - read,
            readPercentage: total > 0 ? Math.round((read / total) * 100) : 0
        };
    }
}

module.exports = new AnnouncementsRepository();
