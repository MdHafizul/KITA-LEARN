/**
 * Progression & Certificates Domain DTOs
 * Validation schemas for StudentProgression and Certificate
 */

const { z } = require('zod');

/**
 * StudentProgression DTOs
 */

const StudentProgressionCreateDTO = z.object({
  userId: z.string().cuid('Invalid user ID'),
  currentLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
  totalPoints: z.number().int().nonnegative().default(0),
  nextMilestonePoints: z.number().int().positive().optional(),
});

const StudentProgressionUpdateDTO = z.object({
  currentLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  totalPoints: z.number().int().nonnegative().optional(),
  nextMilestonePoints: z.number().int().positive().nullable().optional(),
  lastProgressionDate: z.date().optional(),
});

const StudentProgressionResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  currentLevel: z.string(),
  totalPoints: z.number(),
  nextMilestonePoints: z.number().nullable(),
  lastProgressionDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const StudentProgressionWithUserDTO = StudentProgressionResponseDTO.extend({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
  }).optional(),
});

const StudentProgressionFilterDTO = z.object({
  minPoints: z.number().int().nonnegative().optional(),
  maxPoints: z.number().int().nonnegative().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const AwardPointsDTO = z.object({
  userId: z.string().cuid('Invalid user ID'),
  points: z.number().int().positive('Points must be positive'),
  reason: z.string().optional(),
});

const LevelUpDTO = z.object({
  userId: z.string().cuid('Invalid user ID'),
  newLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
});

/**
 * Certificate DTOs
 */

const CertificateCreateDTO = z.object({
  userId: z.string().cuid('Invalid user ID'),
  courseId: z.string().cuid().optional(),
  certificateNumber: z.string().min(3).max(50),
  issuerName: z.string().min(2).max(255).optional(),
  signatureUrl: z.string().url().optional(),
  expiryDate: z.date().optional(),
});

const CertificateUpdateDTO = z.object({
  issuerName: z.string().min(2).max(255).optional(),
  signatureUrl: z.string().url().optional(),
  expiryDate: z.date().optional(),
  isVerified: z.boolean().optional(),
});

const CertificateResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string().nullable(),
  certificateNumber: z.string(),
  issuedDate: z.date(),
  expiryDate: z.date().nullable(),
  verificationCode: z.string(),
  issuerName: z.string().nullable(),
  signatureUrl: z.string().nullable(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CertificateWithUserDTO = CertificateResponseDTO.extend({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
  }).optional(),
});

const CertificateFilterDTO = z.object({
  userId: z.string().cuid().optional(),
  courseId: z.string().cuid().optional(),
  isVerified: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

const VerifyCertificateDTO = z.object({
  certificateNumber: z.string().min(3),
  verificationCode: z.string().min(10),
});

const CertificateValidationDTO = z.object({
  certificateNumber: z.string(),
  verificationCode: z.string(),
});

const BulkCertificateCreateDTO = z.object({
  certificates: z.array(CertificateCreateDTO).min(1),
});

const BulkCertificateVerifyDTO = z.object({
  certificateIds: z.array(z.string().cuid()).min(1),
});

/**
 * Achievement DTOs
 */

const StudentAchievementDTO = z.object({
  userId: z.string(),
  progression: StudentProgressionResponseDTO,
  certificates: z.array(CertificateResponseDTO),
  totalCertificates: z.number(),
  certificatesExpired: z.number(),
  certificatesActive: z.number(),
});

const ProgressionMilestoneDTO = z.object({
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  requiredPoints: z.number(),
  reachedPoints: z.number(),
  progressPercentage: z.number().min(0).max(100),
});

const UserAchievementSummaryDTO = z.object({
  userId: z.string(),
  currentLevel: z.string(),
  totalPoints: z.number(),
  certificatesEarned: z.number(),
  certificatesActive: z.number(),
  nextLevelPoints: z.number().nullable(),
  progressToNextLevel: z.number().min(0).max(100),
  lastUpdated: z.date(),
});

module.exports = {
  // Progression
  StudentProgressionCreateDTO,
  StudentProgressionUpdateDTO,
  StudentProgressionResponseDTO,
  StudentProgressionWithUserDTO,
  StudentProgressionFilterDTO,
  AwardPointsDTO,
  LevelUpDTO,

  // Certificate
  CertificateCreateDTO,
  CertificateUpdateDTO,
  CertificateResponseDTO,
  CertificateWithUserDTO,
  CertificateFilterDTO,
  VerifyCertificateDTO,
  CertificateValidationDTO,
  BulkCertificateCreateDTO,
  BulkCertificateVerifyDTO,

  // Achievements
  StudentAchievementDTO,
  ProgressionMilestoneDTO,
  UserAchievementSummaryDTO,
};
