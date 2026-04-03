/**
 * Classes Domain DTOs
 * Validation schemas for Class, ClassEnrollment, and ClassSession entities
 */

const { z } = require('zod');

// ============================================
// CLASS DTOs
// ============================================

/**
 * ClassCreateDTO
 * Validates data for creating a new class
 */
const ClassCreateDTO = z.object({
  courseId: z.string().cuid('Invalid course ID format'),
  name: z.string().min(2, 'Class name must be at least 2 characters').max(255),
  description: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(), // JSON: { days: [], startTime, endTime }
  location: z.string().optional().nullable(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional().nullable(),
});

/**
 * ClassUpdateDTO
 * Validates data for updating an existing class
 */
const ClassUpdateDTO = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters').max(255).optional(),
  description: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional().nullable(),
});

/**
 * ClassResponseDTO
 * Response format for a single class without nested relations
 */
const ClassResponseDTO = z.object({
  id: z.string().cuid(),
  courseId: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  schedule: z.string().nullable(),
  location: z.string().nullable(),
  capacity: z.number().int().nullable(),
  enrollmentCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * ClassWithRelationsDTO
 * Response format with nested enrollments and sessions
 */
const ClassWithRelationsDTO = ClassResponseDTO.extend({
  course: z.any().optional(),
  enrollments: z.array(z.any()).optional(),
  sessions: z.array(z.any()).optional(),
});

/**
 * ClassFilterDTO
 * Query filters for listing classes
 */
const ClassFilterDTO = z.object({
  courseId: z.string().cuid().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'name', 'enrollmentCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * BulkClassCreateDTO
 * Validates data for bulk creating classes (e.g., multiple sections for one course)
 */
const BulkClassCreateDTO = z.object({
  courseId: z.string().cuid('Invalid course ID format'),
  classes: z.array(
    z.object({
      name: z.string().min(2),
      description: z.string().optional().nullable(),
      schedule: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      capacity: z.number().int().positive().optional().nullable(),
    })
  ).min(1, 'At least one class is required'),
});

// ============================================
// CLASS ENROLLMENT DTOs
// ============================================

/**
 * ClassEnrollmentCreateDTO
 * Validates data for enrolling a student in a class
 */
const ClassEnrollmentCreateDTO = z.object({
  classId: z.string().cuid('Invalid class ID format'),
  userId: z.string().cuid('Invalid user ID format'),
});

/**
 * ClassEnrollmentResponseDTO
 * Response format for class enrollment record
 */
const ClassEnrollmentResponseDTO = z.object({
  id: z.string().cuid(),
  classId: z.string().cuid(),
  userId: z.string().cuid(),
  enrolledAt: z.date(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DROPPED']),
  createdAt: z.date(),
});

/**
 * ClassEnrollmentUpdateDTO
 * Validates data for updating class enrollment status
 */
const ClassEnrollmentUpdateDTO = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'DROPPED']).optional(),
});

/**
 * BulkClassEnrollmentDTO
 * Validates data for bulk enrolling students in a class
 */
const BulkClassEnrollmentDTO = z.object({
  classId: z.string().cuid('Invalid class ID format'),
  userIds: z.array(z.string().cuid()).min(1, 'At least one user ID is required'),
});

// ============================================
// CLASS SESSION DTOs
// ============================================

/**
 * ClassSessionCreateDTO
 * Validates data for creating a new class session
 */
const ClassSessionCreateDTO = z.object({
  classId: z.string().cuid('Invalid class ID format'),
  sessionDate: z.string().datetime('Invalid date format'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  topic: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  recordingUrl: z.string().url('Invalid URL format').optional().nullable(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

/**
 * ClassSessionUpdateDTO
 * Validates data for updating a class session
 */
const ClassSessionUpdateDTO = z.object({
  topic: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  recordingUrl: z.string().url('Invalid URL format').optional().nullable(),
  attendanceCount: z.number().int().min(0).optional(),
});

/**
 * ClassSessionResponseDTO
 * Response format for a single class session
 */
const ClassSessionResponseDTO = z.object({
  id: z.string().cuid(),
  classId: z.string().cuid(),
  sessionDate: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  topic: z.string().nullable(),
  notes: z.string().nullable(),
  recordingUrl: z.string().nullable(),
  attendanceCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * ClassSessionFilterDTO
 * Query filters for listing class sessions
 */
const ClassSessionFilterDTO = z.object({
  classId: z.string().cuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['sessionDate', 'createdAt']).default('sessionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Export all DTOs
module.exports = {
  ClassCreateDTO,
  ClassUpdateDTO,
  ClassResponseDTO,
  ClassWithRelationsDTO,
  ClassFilterDTO,
  BulkClassCreateDTO,
  ClassEnrollmentCreateDTO,
  ClassEnrollmentResponseDTO,
  ClassEnrollmentUpdateDTO,
  BulkClassEnrollmentDTO,
  ClassSessionCreateDTO,
  ClassSessionUpdateDTO,
  ClassSessionResponseDTO,
  ClassSessionFilterDTO,
};
