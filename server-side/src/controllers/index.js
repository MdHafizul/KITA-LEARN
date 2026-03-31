/**
 * Barrel export - Controllers index
 * Centralized export of all controllers
 */

module.exports = {
  AuthController: require('./auth.controller'),
  CourseController: require('./course.controller'),
  ExamController: require('./exam.controller'),
  SubmissionController: require('./submission.controller'),
  GradingController: require('./grading.controller'),
  CertificateController: require('./certificate.controller'),
  EnrollmentController: require('./enrollment.controller'),
  AuditController: require('./audit.controller'),
};
