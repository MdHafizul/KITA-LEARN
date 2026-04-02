const authRoutes = require('./auth.routes');
const courseRoutes = require('./course.routes');
const activityRoutes = require('./activity.routes');
const examRoutes = require('./exam.routes');
const submissionRoutes = require('./submission.routes');
const gradingRoutes = require('./grading.routes');
const certificateRoutes = require('./certificate.routes');
const enrollmentRoutes = require('./enrollment.routes');
const auditRoutes = require('./audit.routes');

module.exports = {
  authRoutes,
  courseRoutes,
  activityRoutes,
  examRoutes,
  submissionRoutes,
  gradingRoutes,
  certificateRoutes,
  enrollmentRoutes,
  auditRoutes
};
