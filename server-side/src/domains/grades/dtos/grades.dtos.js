/**
 * Grades DTOs
 * Validation schemas for grade and rubric endpoints
 */

const { z } = require('zod');

// ============================================
// GRADE CREATE DTO
// ============================================
const GradeCreateDTO = z.object({
    userId: z.union([z.string().cuid(), z.string().uuid()]),
    courseId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    activityId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    scorePoints: z.number().int().min(0),
    totalPoints: z.number().int().min(1),
    percentage: z.number().min(0).max(100),
    gradeValue: z.enum(['A', 'B', 'C', 'D', 'F']),
    feedback: z.string().optional(),
    isPublished: z.boolean().optional()
});

// At least courseId or activityId must be present
GradeCreateDTO.refine(
    (data) => data.courseId || data.activityId,
    { message: "Either courseId or activityId must be provided" }
);

// ============================================
// GRADE UPDATE DTO
// ============================================
const GradeUpdateDTO = z.object({
    scorePoints: z.number().int().min(0).optional(),
    totalPoints: z.number().int().min(1).optional(),
    percentage: z.number().min(0).max(100).optional(),
    gradeValue: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
    feedback: z.string().optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().datetime().optional()
});

// ============================================
// GRADE RESPONSE DTO
// ============================================
const GradeResponseDTO = z.object({
    id: z.string(),
    userId: z.string(),
    courseId: z.string().nullable(),
    activityId: z.string().nullable(),
    scorePoints: z.number().int(),
    totalPoints: z.number().int(),
    percentage: z.number(),
    gradeValue: z.string(),
    feedback: z.string().nullable(),
    isPublished: z.boolean(),
    publishedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// GRADE WITH RELATIONS DTO
// ============================================
const GradeWithRelationsDTO = z.object({
    id: z.string(),
    userId: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string()
    }).optional(),
    courseId: z.string().nullable(),
    activityId: z.string().nullable(),
    scorePoints: z.number().int(),
    totalPoints: z.number().int(),
    percentage: z.number(),
    gradeValue: z.string(),
    feedback: z.string().nullable(),
    isPublished: z.boolean(),
    publishedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// BULK GRADE DTO
// ============================================
const BulkGradeDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    activityId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    grades: z.array(
        z.object({
            userId: z.union([z.string().cuid(), z.string().uuid()]),
            scorePoints: z.number().int().min(0),
            totalPoints: z.number().int().min(1),
            percentage: z.number().min(0).max(100),
            gradeValue: z.enum(['A', 'B', 'C', 'D', 'F']),
            feedback: z.string().optional()
        })
    ).min(1, 'At least one grade required')
});

BulkGradeDTO.refine(
    (data) => data.courseId || data.activityId,
    { message: "Either courseId or activityId must be provided" }
);

// ============================================
// GRADE FILTER DTO
// ============================================
const GradeFilterDTO = z.object({
    userId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    courseId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    activityId: z.union([z.string().cuid(), z.string().uuid()]).optional(),
    isPublished: z.boolean().optional(),
    gradeValue: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
    minPercentage: z.number().min(0).max(100).optional(),
    maxPercentage: z.number().min(0).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
});

// ============================================
// GRADING RUBRIC CREATE DTO
// ============================================
const RubricCreateDTO = z.object({
    name: z.string().min(3).max(255),
    description: z.string().optional(),
    criteria: z.object({}).passthrough(), // JSON criteria
    totalPoints: z.number().int().min(1).optional()
});

// ============================================
// GRADING RUBRIC UPDATE DTO
// ============================================
const RubricUpdateDTO = z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    criteria: z.object({}).passthrough().optional(),
    totalPoints: z.number().int().min(1).optional()
});

// ============================================
// GRADING RUBRIC RESPONSE DTO
// ============================================
const RubricResponseDTO = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    criteria: z.object({}).passthrough(),
    totalPoints: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

module.exports = {
    GradeCreateDTO,
    GradeUpdateDTO,
    GradeResponseDTO,
    GradeWithRelationsDTO,
    BulkGradeDTO,
    GradeFilterDTO,
    RubricCreateDTO,
    RubricUpdateDTO,
    RubricResponseDTO
};
