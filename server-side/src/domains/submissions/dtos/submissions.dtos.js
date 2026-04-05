/**
 * Submissions DTOs
 * Validation schemas for assignment submission endpoints
 */

const { z } = require('zod');

// ============================================
// SUBMISSION CREATE DTO
// ============================================
const SubmissionCreateDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    submissionContent: z.string().min(1, 'Submission content cannot be empty').optional(),
    isLate: z.boolean().optional()
});

// ============================================
// SUBMISSION UPDATE DTO
// ============================================
const SubmissionUpdateDTO = z.object({
    submissionContent: z.string().optional(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']).optional(),
    score: z.number().int().min(0).optional(),
    feedback: z.string().optional(),
    isLate: z.boolean().optional()
});

// ============================================
// SUBMISSION RESPONSE DTO
// ============================================
const SubmissionResponseDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    userId: z.string().cuid(),
    submissionContent: z.string().nullable(),
    submissionDate: z.string().datetime().nullable(),
    submittedAt: z.string().datetime().nullable(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']),
    score: z.number().int().nullable(),
    feedback: z.string().nullable(),
    gradeTime: z.string().datetime().nullable(),
    isLate: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// SUBMISSION WITH RELATIONS DTO
// ============================================
const SubmissionWithRelationsDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    userId: z.string().cuid(),
    submissionContent: z.string().nullable(),
    submissionDate: z.string().datetime().nullable(),
    submittedAt: z.string().datetime().nullable(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']),
    score: z.number().int().nullable(),
    feedback: z.string().nullable(),
    gradeTime: z.string().datetime().nullable(),
    isLate: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    activity: z.object({
        id: z.string().cuid(),
        title: z.string(),
        activityType: z.string()
    }).optional(),
    user: z.object({
        id: z.string().cuid(),
        fullName: z.string(),
        email: z.string().email()
    }).optional()
});

// ============================================
// SUBMISSION GRADE DTO
// ============================================
const SubmissionGradeDTO = z.object({
    score: z.number().int().min(0),
    feedback: z.string().optional(),
    status: z.enum(['GRADED', 'RETURNED']).optional()
});

// ============================================
// SUBMISSION BATCH GRADE DTO
// ============================================
const BatchGradeDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    grades: z.array(
        z.object({
            submissionId: z.union([z.string().cuid(), z.string().uuid()]),
            score: z.number().int().min(0),
            feedback: z.string().optional()
        })
    )
});

// ============================================
// SUBMISSION FILTER DTO
// ============================================
const SubmissionFilterDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    userId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED']).optional(),
    isLate: z.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});

module.exports = {
    SubmissionCreateDTO,
    SubmissionUpdateDTO,
    SubmissionResponseDTO,
    SubmissionWithRelationsDTO,
    SubmissionGradeDTO,
    BatchGradeDTO,
    SubmissionFilterDTO
};
