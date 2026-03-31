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
  code: z.string().min(2).max(10),
  credits: z.number().min(1).max(10),
  instructorId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const CourseUpdateDTO = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  credits: z.number().min(1).max(10).optional(),
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
// EXAM DTOs
// ============================================

const ExamCreateDTO = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  courseId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  durationMinutes: z.number().min(5).max(480),
  totalQuestions: z.number().min(1),
  maxAttempts: z.number().min(1).default(1),
  passingScore: z.number().min(0).max(100).default(60),
});

const ExamUpdateDTO = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  durationMinutes: z.number().min(5).max(480).optional(),
  passingScore: z.number().min(0).max(100).optional(),
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
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterDTO = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
});

const TokenResponseDTO = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: UserResponseDTO,
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
  TokenResponseDTO,

  // Common
  PaginationDTO,
};
