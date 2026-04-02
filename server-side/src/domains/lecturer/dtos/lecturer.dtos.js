/**
 * Lecturer DTOs
 * Validation schemas for lecturer profile endpoints
 */

const { z } = require('zod');

const LecturerCreateDTO = z.object({
    userId: z.union([z.string().cuid(), z.string().uuid()]),
    qualifications: z.string().optional(),
    specialization: z.string().optional(),
    yearsOfExperience: z.number().int().min(0).optional(),
    departmentName: z.string().optional(),
    officeLocation: z.string().optional(),
    officePhone: z.string().optional(),
    researchInterests: z.string().optional()
});

const LecturerUpdateDTO = z.object({
    qualifications: z.string().optional(),
    specialization: z.string().optional(),
    yearsOfExperience: z.number().int().min(0).optional(),
    departmentName: z.string().optional(),
    officeLocation: z.string().optional(),
    officePhone: z.string().optional(),
    researchInterests: z.string().optional(),
    isActive: z.boolean().optional()
});

const LecturerResponseDTO = z.object({
    id: z.string().cuid(),
    userId: z.string().cuid(),
    qualifications: z.string().nullable(),
    specialization: z.string().nullable(),
    yearsOfExperience: z.number().int().nullable(),
    departmentName: z.string().nullable(),
    officeLocation: z.string().nullable(),
    officePhone: z.string().nullable(),
    researchInterests: z.string().nullable(),
    publicationsCount: z.number().int(),
    studentRatings: z.number().nullable(),
    totalStudents: z.number().int(),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
});

module.exports = {
    LecturerCreateDTO,
    LecturerUpdateDTO,
    LecturerResponseDTO
};
