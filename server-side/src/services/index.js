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
  authService,
  courseService,
  examService,
  submissionService,
  gradingService,
  certificateService,
  enrollmentService,
  auditService
};
