/**
 * Repository Index
 * Exports all repository classes for easy access
 */

const BaseRepository = require('./base.repository');
const UserRepository = require('./user.repository');
const CourseRepository = require('./course.repository');
const ExamRepository = require('./exam.repository');
const EnrollmentRepository = require('./enrollment.repository');
const SubmissionRepository = require('./submission.repository');
const GradeRepository = require('./grade.repository');
const AuditLogRepository = require('./audit.repository');
const CertificateRepository = require('./certificate.repository');

// Instantiate repositories (singleton pattern)
const repositories = {
  base: new BaseRepository(),
  user: new UserRepository(),
  course: new CourseRepository(),
  exam: new ExamRepository(),
  enrollment: new EnrollmentRepository(),
  submission: new SubmissionRepository(),
  grade: new GradeRepository(),
  auditLog: new AuditLogRepository(),
  certificate: new CertificateRepository(),
};

/**
 * Usage Example:
 *
 * // In your service or controller
 * const { user, course, exam } = require('./repositories');
 *
 * // Find a user
 * const user = await repositories.user.findById(userId);
 *
 * // Find courses
 * const courses = await repositories.course.findPublished();
 *
 * // Create enrollment
 * const enrollment = await repositories.enrollment.create({
 *   userId,
 *   courseId,
 *   enrolledAt: new Date(),
 * });
 */

module.exports = repositories;
