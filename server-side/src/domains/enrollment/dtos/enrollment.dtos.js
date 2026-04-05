/**
 * Enrollment DTOs
 * Validation schemas for course enrollment endpoints
 */

const { z } = require('zod');

// ============================================
// ENROLLMENT CREATE DTO
// ============================================
const EnrollmentCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    userId: z.union([z.string().cuid(), z.string().uuid()])
});

// ============================================
// ENROLLMENT UPDATE DTO
// ============================================
const EnrollmentUpdateDTO = z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'COMPLETED', 'DROPPED']).optional(),
    progressPercent: z.number().int().min(0).max(100).optional(),
    completionDate: z.string().datetime().optional()
});

// ============================================
// ENROLLMENT RESPONSE DTO
// ============================================
const EnrollmentResponseDTO = z.object({
    id: z.string().cuid(),
    courseId: z.string().cuid(),
    userId: z.string().cuid(),
    enrollmentDate: z.string().datetime(),
    progressPercent: z.number().int(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'COMPLETED', 'DROPPED']),
    completionDate: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// ENROLLMENT WITH RELATIONS DTO
// ============================================
const EnrollmentWithRelationsDTO = z.object({
    id: z.string().cuid(),
    courseId: z.string().cuid(),
    userId: z.string().cuid(),
    enrollmentDate: z.string().datetime(),
    progressPercent: z.number().int(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'COMPLETED', 'DROPPED']),
    completionDate: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    course: z.object({
        id: z.string().cuid(),
        title: z.string(),
        code: z.string().optional(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    }).optional(),
    user: z.object({
        id: z.string().cuid(),
        fullName: z.string(),
        email: z.string().email()
    }).optional()
});

// ============================================
// BULK ENROLLMENT DTO (for batch operations)
// ============================================
const BulkEnrollmentDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    userIds: z.array(z.union([z.string().cuid(), z.string().uuid()]))
});

// ============================================
// ENROLLMENT FILTER DTO
// ============================================
const EnrollmentFilterDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    userId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'COMPLETED', 'DROPPED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});

module.exports = {
    EnrollmentCreateDTO,
    EnrollmentUpdateDTO,
    EnrollmentResponseDTO,
    EnrollmentWithRelationsDTO,
    BulkEnrollmentDTO,
    EnrollmentFilterDTO
};
