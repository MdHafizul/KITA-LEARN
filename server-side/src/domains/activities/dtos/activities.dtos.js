/**
 * Activities DTOs
 * Validation schemas for learning activity, prerequisites, content, and assignment endpoints
 */

const { z } = require('zod');

// ============================================
// Learning Activity DTOs
// ============================================

const LearningActivityCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    title: z.string().min(3).max(255),
    description: z.string().min(10).optional(),
    activityType: z.enum(['CONTENT', 'ASSIGNMENT', 'EXAM', 'INTERACTIVE', 'DISCUSSION']),
    contentFile: z.string().optional(),
    instructions: z.string().optional(),
    durationMinutes: z.number().int().min(1).optional(),
    maxAttempts: z.number().int().min(1).optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    points: z.number().int().min(0).optional(),
    displayOrder: z.number().int().min(0).optional()
});

const LearningActivityUpdateDTO = z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    contentFile: z.string().optional(),
    instructions: z.string().optional(),
    durationMinutes: z.number().int().min(1).optional(),
    maxAttempts: z.number().int().min(1).optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    points: z.number().int().min(0).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional()
});

const LearningActivityResponseDTO = z.object({
    id: z.string().cuid(),
    courseId: z.string().cuid(),
    title: z.string(),
    description: z.string().nullable(),
    activityType: z.string(),
    contentFile: z.string().nullable(),
    instructions: z.string().nullable(),
    durationMinutes: z.number().int().nullable(),
    maxAttempts: z.number().int().nullable(),
    passingScore: z.number().int().nullable(),
    startDate: z.string().datetime().nullable(),
    endDate: z.string().datetime().nullable(),
    points: z.number().int().nullable(),
    displayOrder: z.number().int(),
    isPublished: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Activity Prerequisite DTOs
// ============================================

const ActivityPrerequisiteCreateDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    prerequisiteActivityId: z.union([z.string().cuid(), z.string().uuid()])
});

const ActivityPrerequisiteResponseDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    prerequisiteActivityId: z.string().cuid(),
    createdAt: z.string().datetime()
});

// ============================================
// Content Activity DTOs
// ============================================

const ContentActivityCreateDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    contentUrl: z.string().url(),
    contentType: z.enum(['TEXT', 'VIDEO', 'IMAGE', 'PDF']),
    duration: z.number().int().min(0).optional()
});

const ContentActivityUpdateDTO = z.object({
    contentUrl: z.string().url().optional(),
    contentType: z.enum(['TEXT', 'VIDEO', 'IMAGE', 'PDF']).optional(),
    duration: z.number().int().min(0).optional()
});

const ContentActivityResponseDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    contentUrl: z.string(),
    contentType: z.string(),
    duration: z.number().int().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Assignment DTOs
// ============================================

const AssignmentCreateDTO = z.object({
    activityId: z.union([z.string().cuid(), z.string().uuid()]),
    instructions: z.string().min(10),
    submissionDeadline: z.string().datetime(),
    totalPoints: z.number().int().min(1).optional(),
    lateSubmissionAllowed: z.boolean().optional(),
    daysAfterDeadline: z.number().int().min(0).optional()
});

const AssignmentUpdateDTO = z.object({
    instructions: z.string().min(10).optional(),
    submissionDeadline: z.string().datetime().optional(),
    totalPoints: z.number().int().min(1).optional(),
    lateSubmissionAllowed: z.boolean().optional(),
    daysAfterDeadline: z.number().int().min(0).optional()
});

const AssignmentResponseDTO = z.object({
    id: z.string().cuid(),
    activityId: z.string().cuid(),
    instructions: z.string(),
    submissionDeadline: z.string().datetime(),
    totalPoints: z.number().int(),
    lateSubmissionAllowed: z.boolean(),
    daysAfterDeadline: z.number().int().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

module.exports = {
    LearningActivityCreateDTO,
    LearningActivityUpdateDTO,
    LearningActivityResponseDTO,
    ActivityPrerequisiteCreateDTO,
    ActivityPrerequisiteResponseDTO,
    ContentActivityCreateDTO,
    ContentActivityUpdateDTO,
    ContentActivityResponseDTO,
    AssignmentCreateDTO,
    AssignmentUpdateDTO,
    AssignmentResponseDTO
};
