/**
 * Documentation Contract (Professional Node.js)
 * Desc: Route file maps HTTP verbs and URLs to controller handlers with validation and middleware chain.
 * Params: Document all path/query params in each endpoint comment and validate with DTO/Zod schema.
 * Body: Document request payload schema for POST/PUT/PATCH endpoints and apply validateBody middleware.
 * Auth Headers: Declare auth requirement per endpoint (Public or Authorization: Bearer <token>) and required roles.
 */

/**
 * Identity Routes
 * Express endpoints for authentication, user management, roles, permissions
 * Middleware: auth (require token), admin (require admin role)
 */

const express = require('express');
const router = express.Router();
const identityController = require('../controllers/identity.controller');
const { authMiddleware, requireRole } = require('../../../middleware/auth.middleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/register', identityController.register);

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', identityController.login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /api/v1/auth/logout
 * Logout user (invalidate token client-side)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/logout', authMiddleware, identityController.logout);

/**
 * POST /api/v1/auth/verify-email
 * Verify user email address
 */
router.post('/verify-email', authMiddleware, identityController.verifyEmail);

/**
 * POST /api/v1/auth/change-password
 * Change current user's password
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/change-password', authMiddleware, identityController.changePassword);

// ============================================
// USER PROFILE ROUTES
// ============================================

/**
 * GET /api/v1/auth/profile
 * Get current user profile
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/profile', authMiddleware, identityController.getMyProfile);

/**
 * PUT /api/v1/auth/profile
 * Update current user profile
 */
router.put('/profile', authMiddleware, identityController.updateMyProfile);

/**
 * GET /api/v1/auth/profile/roles
 * Get current user's roles
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/profile/roles', authMiddleware, identityController.getMyRoles);

/**
 * GET /api/v1/users/:userId
 * Get user profile by ID (Admin-only)
 */
router.get('/users/:userId', authMiddleware, identityController.getUserById);

/**
 * GET /api/v1/users
 * List users with filtering (Admin-only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/users', authMiddleware, identityController.listUsers);

/**
 * DELETE /api/v1/users/:userId
 * Delete user account (Admin-only)
 */
router.delete('/users/:userId', authMiddleware, requireRole(['ADMIN']), identityController.deleteUser);

// ============================================
// ROLE ROUTES (Admin-only)
// ============================================

/**
 * POST /api/v1/auth/roles
 * Create a new role
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/roles', authMiddleware, identityController.createRole);

/**
 * GET /api/v1/auth/roles
 * List all roles with pagination
 */
router.get('/roles', authMiddleware, identityController.listRoles);

/**
 * GET /api/v1/auth/roles/:roleId
 * Get role by ID
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/roles/:roleId', authMiddleware, identityController.getRoleById);

/**
 * PUT /api/v1/auth/roles/:roleId
 * Update a role
 */
router.put('/roles/:roleId', authMiddleware, identityController.updateRole);

/**
 * DELETE /api/v1/auth/roles/:roleId
 * Delete a role (Admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.delete('/roles/:roleId', authMiddleware, requireRole(['ADMIN']), identityController.deleteRole);

// ============================================
// PERMISSION ROUTES (Admin-only)
// ============================================

/**
 * POST /api/v1/auth/permissions
 * Create a new permission
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/permissions', authMiddleware, identityController.createPermission);

/**
 * GET /api/v1/auth/permissions
 * List all permissions with pagination
 */
router.get('/permissions', authMiddleware, identityController.listPermissions);

/**
 * PUT /api/v1/auth/permissions/:permissionId
 * Update a permission
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.put('/permissions/:permissionId', authMiddleware, identityController.updatePermission);

/**
 * DELETE /api/v1/auth/permissions/:permissionId
 * Delete a permission (Admin only)
 */
router.delete('/permissions/:permissionId', authMiddleware, requireRole(['ADMIN']), identityController.deletePermission);

// ============================================
// ROLE-PERMISSION ASSIGNMENT ROUTES
// ============================================

/**
 * POST /api/v1/auth/roles/:roleId/permissions
 * Assign permission to role
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/roles/:roleId/permissions', authMiddleware, identityController.assignPermissionToRole);

/**
 * GET /api/v1/auth/roles/:roleId/permissions
 * Get all permissions for a role
 */
router.get('/roles/:roleId/permissions', authMiddleware, identityController.getRolePermissions);

/**
 * DELETE /api/v1/auth/roles/:roleId/permissions/:permissionId
 * Remove permission from role (Admin only)
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.delete(
  '/roles/:roleId/permissions/:permissionId',
  authMiddleware,
  requireRole(['ADMIN']),
  identityController.removePermissionFromRole
);

// ============================================
// USER-ROLE ASSIGNMENT ROUTES
// ============================================

/**
 * POST /api/v1/auth/users/:userId/roles
 * Assign role to user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.post('/users/:userId/roles', authMiddleware, identityController.assignRoleToUser);

/**
 * POST /api/v1/auth/users/:userId/roles/bulk
 * Bulk assign multiple roles to user
 */
router.post('/users/:userId/roles/bulk', authMiddleware, identityController.bulkAssignRolesToUser);

/**
 * GET /api/v1/auth/users/:userId/roles
 * Get all roles for a user
 */
/**
 * Desc: Route endpoint mapping to controller with middleware execution chain.
 * Params: Validate all path/query params using DTO/Zod schema or validateParams middleware.
 * Body: Validate request payload for POST/PUT/PATCH using validateBody and DTO schema.
 * Auth Headers: Declare endpoint as Public or require Authorization: Bearer <token> with role middleware.
 */
router.get('/users/:userId/roles', authMiddleware, identityController.getUserRoles);

/**
 * DELETE /api/v1/auth/users/:userId/roles/:roleId
 * Remove role from user (Admin only)
 */
router.delete('/users/:userId/roles/:roleId', authMiddleware, requireRole(['ADMIN']), identityController.removeRoleFromUser);

module.exports = router;


