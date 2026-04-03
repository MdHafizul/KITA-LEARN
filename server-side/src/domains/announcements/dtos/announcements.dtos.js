/**
 * Announcements DTOs
 * Validation schemas for announcement endpoints
 */

const { z } = require('zod');

// ============================================
// ANNOUNCEMENT CREATE DTO
// ============================================
const AnnouncementCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    title: z.string().min(3).max(255),
    content: z.string().min(10),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    attachmentUrl: z.string().url().optional(),
    expiresAt: z.string().datetime().optional()
});

// ============================================
// ANNOUNCEMENT UPDATE DTO
// ============================================
const AnnouncementUpdateDTO = z.object({
    title: z.string().min(3).max(255).optional(),
    content: z.string().min(10).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    attachmentUrl: z.string().url().optional(),
    expiresAt: z.string().datetime().optional()
});

// ============================================
// ANNOUNCEMENT RESPONSE DTO
// ============================================
const AnnouncementResponseDTO = z.object({
    id: z.string(),
    courseId: z.string(),
    title: z.string(),
    content: z.string(),
    priority: z.string(),
    attachmentUrl: z.string().nullable(),
    publishedAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// ANNOUNCEMENT WITH RELATIONS DTO
// ============================================
const AnnouncementWithRelationsDTO = z.object({
    id: z.string(),
    courseId: z.string(),
    course: z.object({
        id: z.string(),
        title: z.string()
    }).optional(),
    title: z.string(),
    content: z.string(),
    priority: z.string(),
    attachmentUrl: z.string().nullable(),
    publishedAt: z.string().datetime(),
    expiresAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    recipients: z.array(
        z.object({
            id: z.string(),
            userId: z.string(),
            readAt: z.string().datetime().nullable()
        })
    ).optional()
});

// ============================================
// ANNOUNCEMENT FILTER DTO
// ============================================
const AnnouncementFilterDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isExpired: z.boolean().optional(),
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional()
});

// ============================================
// ANNOUNCEMENT READ DTO
// ============================================
const AnnouncementReadDTO = z.object({
    announcementId: z.union([z.string().cuid(), z.string().uuid()])
});

// ============================================
// BULK ANNOUNCEMENT CREATE DTO
// ============================================
const BulkAnnouncementCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    announcements: z.array(
        z.object({
            title: z.string().min(3).max(255),
            content: z.string().min(10),
            priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
            attachmentUrl: z.string().url().optional(),
            expiresAt: z.string().datetime().optional()
        })
    ).min(1, 'At least one announcement required')
});

// ============================================
// ANNOUNCEMENT RECIPIENT DTO
// ============================================
const AnnouncementRecipientDTO = z.object({
    id: z.string(),
    announcementId: z.string(),
    userId: z.string(),
    readAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime()
});

module.exports = {
    AnnouncementCreateDTO,
    AnnouncementUpdateDTO,
    AnnouncementResponseDTO,
    AnnouncementWithRelationsDTO,
    AnnouncementFilterDTO,
    AnnouncementReadDTO,
    BulkAnnouncementCreateDTO,
    AnnouncementRecipientDTO
};
