/**
 * Data Transfer Objects (DTOs)
 * Define the shape of data for API requests/responses
 */

const { z } = require('zod');

// ============================================
// USER DTOs
// ============================================

const UserCreateDTO = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

const UserUpdateDTO = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});

const UserResponseDTO = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  phoneNumber: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  createdAt: z.string(),
});

// ============================================
// COURSE DTOs
// ============================================

const CourseCreateDTO = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  creditHours: z.number().int().min(1).max(10, 'Credit hours must be between 1-10'),
  maxStudents: z.number().int().min(1).max(500, 'Max students must be between 1-500'),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], 'Invalid difficulty level'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
});

const CourseUpdateDTO = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  creditHours: z.number().int().min(1).max(10).optional(),
  maxStudents: z.number().int().min(1).max(500).optional(),
  difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

const CourseResponseDTO = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  code: z.string(),
  credits: z.number(),
  status: z.string(),
  instructorId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
});

// ============================================
// LEARNING ACTIVITY DTOs
// ============================================

const ActivityCreateDTO = z.object({
  courseId: z.union([z.string().cuid(), z.string().uuid()]),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  activityType: z.enum(['CONTENT', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'DISCUSSION']),
  contentFile: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  points: z.number().int().min(0).default(0),
});

const ActivityUpdateDTO = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  contentFile: z.string().optional(),
  instructions: z.string().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  points: z.number().int().min(0).optional(),
});

const ActivityResponseDTO = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  activityType: z.string(),
  isPublished: z.boolean(),
  createdAt: z.string(),
});

// ============================================
// EXAM DTOs
// ============================================

const ExamCreateDTO = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  activityId: z.union([z.string().cuid(), z.string().uuid()]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeLimit: z.number().min(5).max(480),
  totalQuestions: z.number().min(1),
  passingScore: z.number().min(0).max(100).default(50),
  shuffleQuestions: z.boolean().optional().default(true),
});

const ExamUpdateDTO = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  timeLimit: z.number().min(5).max(480).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  shuffleQuestions: z.boolean().optional(),
});

const ExamResponseDTO = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  courseId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  durationMinutes: z.number(),
  totalQuestions: z.number(),
  maxAttempts: z.number(),
  passingScore: z.number(),
});

// ============================================
// ENROLLMENT DTOs
// ============================================

const EnrollmentCreateDTO = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

const EnrollmentResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  status: z.string(),
  enrolledAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});

// ============================================
// SUBMISSION DTOs
// ============================================

const SubmissionCreateDTO = z.object({
  assignmentId: z.string().uuid(),
  content: z.string().min(1),
  fileUrl: z.string().url().optional(),
});

const SubmissionUpdateDTO = z.object({
  content: z.string().min(1).optional(),
  fileUrl: z.string().url().optional(),
});

const SubmissionResponseDTO = z.object({
  id: z.string(),
  assignmentId: z.string(),
  userId: z.string(),
  content: z.string(),
  fileUrl: z.string().nullable(),
  submittedAt: z.string().nullable(),
  grade: z.number().nullable(),
  feedback: z.string().nullable(),
});

// ============================================
// GRADE DTOs
// ============================================

const GradeCreateDTO = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  score: z.number().min(0).max(100),
  remarks: z.string().optional(),
});

const GradeUpdateDTO = z.object({
  score: z.number().min(0).max(100).optional(),
  remarks: z.string().optional(),
});

const GradeResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  score: z.number(),
  remarks: z.string().nullable(),
  gradedAt: z.string().nullable(),
});

// ============================================
// CERTIFICATE DTOs
// ============================================

const CertificateResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  certificateCode: z.string(),
  issuedAt: z.string(),
  expiresAt: z.string().nullable(),
  certificateUrl: z.string().url().nullable(),
});

// ============================================
// AUTH DTOs
// ============================================

const LoginDTO = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const RegisterDTO = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().optional(),
  role: z.enum(['student', 'lecturer']).default('student')
});

const RefreshTokenDTO = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const UpdateProfileDTO = z.object({
  full_name: z.string().min(2, 'Full name is required').optional(),
  phone_number: z.string().optional(),
  email: z.string().email('Invalid email address').optional()
});

const ChangePasswordDTO = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirmation password must be at least 6 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

const TokenResponseDTO = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.string()
  })
});

// ============================================
// PAGINATION DTO
// ============================================

const PaginationDTO = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Export all DTOs
module.exports = {
  // User
  UserCreateDTO,
  UserUpdateDTO,
  UserResponseDTO,

  // Course
  CourseCreateDTO,
  CourseUpdateDTO,
  CourseResponseDTO,

  // Learning Activity
  ActivityCreateDTO,
  ActivityUpdateDTO,
  ActivityResponseDTO,

  // Exam
  ExamCreateDTO,
  ExamUpdateDTO,
  ExamResponseDTO,

  // Enrollment
  EnrollmentCreateDTO,
  EnrollmentResponseDTO,

  // Submission
  SubmissionCreateDTO,
  SubmissionUpdateDTO,
  SubmissionResponseDTO,

  // Grade
  GradeCreateDTO,
  GradeUpdateDTO,
  GradeResponseDTO,

  // Certificate
  CertificateResponseDTO,

  // Auth
  LoginDTO,
  RegisterDTO,
  RefreshTokenDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
  TokenResponseDTO,

  // Common
  PaginationDTO,
};
