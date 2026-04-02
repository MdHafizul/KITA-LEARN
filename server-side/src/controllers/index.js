/**
 * Barrel export - Controllers index
 * Centralized export of all controllers
 */

module.exports = {
  authController: require('./auth.controller'),
  courseController: require('./course.controller'),
  activityController: require('./activity.controller'),
  examController: require('./exam.controller'),
  submissionController: require('./submission.controller'),
  gradingController: require('./grading.controller'),
  certificateController: require('./certificate.controller'),
  enrollmentController: require('./enrollment.controller'),
  auditController: require('./audit.controller'),
};
