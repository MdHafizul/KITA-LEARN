/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Classes Routes
 * Express routes for Class, ClassEnrollment, and ClassSession operations
 * 22+ endpoints organized by resource type
 */

const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classes.controller');
const { authMiddleware, adminBypass, authorizeLecturer, authorizeStudent } = require('../../../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware, adminBypass);

// ============================================
// CLASS ENDPOINTS (6 routes)
// ============================================

/**
 * GET /api/v1/classes/:classId
 * Get a specific class by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/:classId', classesController.getClass);

/**
 * PUT /api/v1/classes/:classId
 * Update a class (Lecturer-only)
 */
router.put('/:classId', classesController.updateClass);

/**
 * DELETE /api/v1/classes/:classId
 * Delete a class (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.delete('/:classId', authMiddleware, adminBypass, authorizeLecturer, classesController.deleteClass);

/**
 * GET /api/v1/classes/:classId/details
 * Get class with full relations (Lecturer-only admin view)
 */
router.get('/:classId/details', classesController.getClassDetails);

/**
 * GET /api/v1/classes
 * Filter classes with advanced options
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/', classesController.filterClasses);

/**
 * GET /api/v1/classes/me
 * Get all classes for current student
 */
router.get('/me/my-classes', classesController.getMyClasses);

// ============================================
// COURSE-SPECIFIC CLASS ENDPOINTS (4 routes)
// ============================================

/**
 * POST /api/v1/courses/:courseId/classes
 * Create a new class (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/:courseId/classes', classesController.createClass);

/**
 * GET /api/v1/courses/:courseId/classes
 * Get all classes for a course
 */
router.get('/:courseId/classes', classesController.getClassesByCourse);

/**
 * POST /api/v1/courses/:courseId/classes/bulk
 * Bulk create classes (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/:courseId/classes/bulk', classesController.createBulkClasses);

// ============================================
// ENROLLMENT ENDPOINTS (6 routes)
// ============================================

/**
 * POST /api/v1/classes/:classId/enroll
 * Enroll student in a class
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/:classId/enroll', classesController.enrollInClass);

/**
 * POST /api/v1/classes/:classId/bulk-enroll
 * Bulk enroll students in a class (Lecturer-only)
 */
router.post('/:classId/bulk-enroll', classesController.bulkEnrollStudents);

/**
 * GET /api/v1/classes/:classId/enrollments
 * Get all enrollments for a class (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/:classId/enrollments', classesController.getEnrollments);

/**
 * PUT /api/v1/enrollments/:enrollmentId
 * Update enrollment status (Lecturer-only)
 */
router.put('/enrollments/:enrollmentId', classesController.updateEnrollmentStatus);

/**
 * DELETE /api/v1/enrollments/:enrollmentId
 * Remove student from class (Lecturer/Admin)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.delete('/enrollments/:enrollmentId', authMiddleware, adminBypass, authorizeLecturer, classesController.removeFromClass);

// ============================================
// SESSION ENDPOINTS (7 routes)
// ============================================

/**
 * POST /api/v1/classes/:classId/sessions
 * Create a class session (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/:classId/sessions', classesController.createSession);

/**
 * GET /api/v1/classes/:classId/sessions
 * Get all sessions for a class
 */
router.get('/:classId/sessions', classesController.getSessionsByClass);

/**
 * GET /api/v1/classes/:classId/sessions/upcoming
 * Get upcoming sessions for a class
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/:classId/sessions/upcoming', classesController.getUpcomingSessions);

/**
 * GET /api/v1/sessions/:sessionId
 * Get a specific session
 */
router.get('/sessions/:sessionId', classesController.getSession);

/**
 * PUT /api/v1/sessions/:sessionId
 * Update a session (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.put('/sessions/:sessionId', classesController.updateSession);

/**
 * DELETE /api/v1/sessions/:sessionId
 * Delete a session (Lecturer/Admin)
 */
router.delete('/sessions/:sessionId', authMiddleware, adminBypass, authorizeLecturer, classesController.deleteSession);

/**
 * POST /api/v1/sessions/:sessionId/attendance
 * Record attendance for a session (Lecturer-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/sessions/:sessionId/attendance', classesController.recordAttendance);

module.exports = router;


