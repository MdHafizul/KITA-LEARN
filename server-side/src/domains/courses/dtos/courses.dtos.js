/**
 * Courses DTOs
 * Validation schemas for course, prerequisite, and material endpoints
 */

const { z } = require('zod');

// ============================================
// Course DTOs
// ============================================

const CourseCreateDTO = z.object({
    lecturerId: z.union([z.string().cuid(), z.string().uuid()]),
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    code: z.string().min(2).max(20).optional(),
    creditHours: z.number().int().min(1).max(10).optional(),
    maxStudents: z.number().int().min(1).max(500).optional(),
    difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});

const CourseUpdateDTO = z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    code: z.string().min(2).max(20).optional(),
    creditHours: z.number().int().min(1).max(10).optional(),
    maxStudents: z.number().int().min(1).max(500).optional(),
    difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    isPublished: z.boolean().optional()
});

const CourseResponseDTO = z.object({
    id: z.string().cuid(),
    lecturerId: z.string().cuid(),
    title: z.string(),
    description: z.string(),
    code: z.string().nullable(),
    creditHours: z.number().int().nullable(),
    maxStudents: z.number().int().nullable(),
    difficultyLevel: z.string().nullable(),
    status: z.string(),
    enrollmentCount: z.number().int(),
    startDate: z.string().datetime().nullable(),
    endDate: z.string().datetime().nullable(),
    isPublished: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

// ============================================
// Course Prerequisite DTOs
// ============================================

const CoursePrerequisiteCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    prerequisiteCourseId: z.union([z.string().cuid(), z.string().uuid()])
});

const CoursePrerequisiteResponseDTO = z.object({
    id: z.string().cuid(),
    courseId: z.string().cuid(),
    prerequisiteCourseId: z.string().cuid(),
    createdAt: z.string().datetime()
});

// ============================================
// Course Material DTOs
// ============================================

const CourseMaterialCreateDTO = z.object({
    courseId: z.union([z.string().cuid(), z.string().uuid()]),
    title: z.string().min(3).max(255),
    description: z.string().optional(),
    materialType: z.enum(['PDF', 'VIDEO', 'IMAGE', 'LINK', 'FILE', 'DOCUMENT']),
    url: z.string().url(),
    fileSize: z.number().int().min(0).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isDownloadable: z.boolean().optional()
});

const CourseMaterialUpdateDTO = z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    materialType: z.enum(['PDF', 'VIDEO', 'IMAGE', 'LINK', 'FILE', 'DOCUMENT']).optional(),
    url: z.string().url().optional(),
    fileSize: z.number().int().min(0).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isDownloadable: z.boolean().optional()
});

const CourseMaterialResponseDTO = z.object({
    id: z.string().cuid(),
    courseId: z.string().cuid(),
    title: z.string(),
    description: z.string().nullable(),
    materialType: z.string(),
    url: z.string(),
    fileSize: z.number().int().nullable(),
    displayOrder: z.number().int(),
    isDownloadable: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

module.exports = {
    CourseCreateDTO,
    CourseUpdateDTO,
    CourseResponseDTO,
    CoursePrerequisiteCreateDTO,
    CoursePrerequisiteResponseDTO,
    CourseMaterialCreateDTO,
    CourseMaterialUpdateDTO,
    CourseMaterialResponseDTO
};
