/**
 * Application Constants
 * Centralized constant values
 */

const statusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const errorMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action',
  INVALID_TOKEN: 'Invalid or expired token',
  COURSE_NOT_FOUND: 'Course not found',
  EXAM_NOT_FOUND: 'Exam not found',
  INVALID_REQUEST: 'Invalid request data',
  DATABASE_ERROR: 'Database operation failed',
  INTERNAL_ERROR: 'Internal server error'
};

const roles = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
  GUEST: 'guest'
};

const permissions = {
  // Course permissions
  CREATE_COURSE: 'create_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',
  PUBLISH_COURSE: 'publish_course',

  // Exam permissions
  CREATE_EXAM: 'create_exam',
  EDIT_EXAM: 'edit_exam',
  DELETE_EXAM: 'delete_exam',
  GRADE_EXAM: 'grade_exam',

  // Assignment permissions
  CREATE_ASSIGNMENT: 'create_assignment',
  GRADE_ASSIGNMENT: 'grade_assignment',

  // User permissions
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',

  // Student permissions
  VIEW_GRADES: 'view_grades',
  SUBMIT_ASSIGNMENT: 'submit_assignment'
};

const courseStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

const enrollmentStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  DROPPED: 'dropped'
};

const examStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed'
};

const attemptStatus = {
  ONGOING: 'ongoing',
  SUBMITTED: 'submitted',
  GRADED: 'graded'
};

const gradeLetters = {
  'A': { min: 90, max: 100 },
  'B': { min: 80, max: 89 },
  'C': { min: 70, max: 79 },
  'D': { min: 60, max: 69 },
  'F': { min: 0, max: 59 }
};

module.exports = {
  statusCodes,
  errorMessages,
  roles,
  permissions,
  courseStatus,
  enrollmentStatus,
  examStatus,
  attemptStatus,
  gradeLetters
};
