/**
 * Services Barrel Export
 * All business logic services available from this index
 */

const authService = require('./auth.service');
const courseService = require('./course.service');
const examService = require('./exam.service');
const submissionService = require('./submission.service');
const gradingService = require('./grading.service');
const certificateService = require('./certificate.service');
const enrollmentService = require('./enrollment.service');
const auditService = require('./audit.service');

module.exports = {
  // PascalCase exports (for controller destructuring)
  AuthService: authService,
  CourseService: courseService,
  ExamService: examService,
  SubmissionService: submissionService,
  GradingService: gradingService,
  CertificateService: certificateService,
  EnrollmentService: enrollmentService,
  AuditService: auditService,

  // camelCase exports (for direct imports like require('./services/auth.service'))
  authService,
  courseService,
  examService,
  submissionService,
  gradingService,
  certificateService,
  enrollmentService,
  auditService
};
