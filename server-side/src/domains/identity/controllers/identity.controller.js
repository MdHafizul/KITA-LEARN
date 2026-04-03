/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Identity Controller
 * HTTP request/response handlers for Identity domain
 * Handles validation, status codes, error propagation
 */

const identityService = require('../services/identity.service');
const {
  UserRegisterDTO,
  UserLoginDTO,
  UserUpdateDTO,
  ChangePasswordDTO,
  UserFilterDTO,
  RoleCreateDTO,
  RoleUpdateDTO,
  PermissionCreateDTO,
  PermissionUpdateDTO,
  AssignPermissionToRoleDTO,
  AssignRoleToUserDTO,
  BulkAssignRolesToUserDTO,
} = require('../dtos/identity.dtos');

class IdentityController {
  // ============================================
  // USER AUTHENTICATION HANDLERS
  // ============================================

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async register(req, res, next) {
    try {
      const data = UserRegisterDTO.parse(req.body);
      const result = await identityService.registerUser(data);
      res.status(201).json({ success: true, data: result, message: 'User registered successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticate user login
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async login(req, res, next) {
    try {
      const { email, password } = UserLoginDTO.parse(req.body);
      const result = await identityService.loginUser(email, password);
      res.status(200).json({ success: true, data: result, message: 'Login successful' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side cleanup)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async logout(req, res, next) {
    try {
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/change-password
   * Change user password
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = ChangePasswordDTO.parse(req.body);
      const result = await identityService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ success: true, data: result, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-email
   * Verify user email
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async verifyEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await identityService.verifyEmail(userId);
      res.status(200).json({ success: true, data: result, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // USER PROFILE HANDLERS
  // ============================================

  /**
   * GET /api/v1/users/me
   * Get current user profile
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await identityService.getUserProfile(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me
   * Update current user profile
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const data = UserUpdateDTO.parse(req.body);
      const user = await identityService.updateUserProfile(userId, data);
      res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:userId
   * Get user profile by ID (Admin-only)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await identityService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users
   * List users with filtering (Admin-only)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async listUsers(req, res, next) {
    try {
      const filters = UserFilterDTO.parse(req.query);
      const result = await identityService.filterUsers(filters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:userId
   * Delete user account (Admin-only)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      await identityService.deleteUser(userId);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ROLE HANDLERS (Admin-only)
  // ============================================

  /**
   * POST /api/v1/roles
   * Create a new role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async createRole(req, res, next) {
    try {
      const data = RoleCreateDTO.parse(req.body);
      const role = await identityService.createRole(data);
      res.status(201).json({ success: true, data: role, message: 'Role created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/roles/:roleId
   * Get role by ID
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getRoleById(req, res, next) {
    try {
      const { roleId } = req.params;
      const role = await identityService.getRoleById(roleId);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/roles
   * List all roles
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async listRoles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await identityService.getAllRoles(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/roles/:roleId
   * Update a role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const data = RoleUpdateDTO.parse(req.body);
      const role = await identityService.updateRole(roleId, data);
      res.status(200).json({ success: true, data: role, message: 'Role updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/roles/:roleId
   * Delete a role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async deleteRole(req, res, next) {
    try {
      const { roleId } = req.params;
      await identityService.deleteRole(roleId);
      res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // PERMISSION HANDLERS (Admin-only)
  // ============================================

  /**
   * POST /api/v1/permissions
   * Create a new permission
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async createPermission(req, res, next) {
    try {
      const data = PermissionCreateDTO.parse(req.body);
      const permission = await identityService.createPermission(data);
      res
        .status(201)
        .json({ success: true, data: permission, message: 'Permission created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/permissions
   * List all permissions
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async listPermissions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await identityService.getAllPermissions(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/permissions/:permissionId
   * Update a permission
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updatePermission(req, res, next) {
    try {
      const { permissionId } = req.params;
      const data = PermissionUpdateDTO.parse(req.body);
      const permission = await identityService.updatePermission(permissionId, data);
      res
        .status(200)
        .json({ success: true, data: permission, message: 'Permission updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/permissions/:permissionId
   * Delete a permission
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async deletePermission(req, res, next) {
    try {
      const { permissionId } = req.params;
      await identityService.deletePermission(permissionId);
      res.status(200).json({ success: true, message: 'Permission deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ROLE-PERMISSION ASSIGNMENT HANDLERS
  // ============================================

  /**
   * POST /api/v1/roles/:roleId/permissions
   * Assign permission to role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async assignPermissionToRole(req, res, next) {
    try {
      const { roleId } = req.params;
      const { permissionId } = AssignPermissionToRoleDTO.parse(req.body);
      const assignment = await identityService.assignPermissionToRole(roleId, permissionId);
      res
        .status(201)
        .json({ success: true, data: assignment, message: 'Permission assigned to role' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/roles/:roleId/permissions/:permissionId
   * Remove permission from role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async removePermissionFromRole(req, res, next) {
    try {
      const { roleId, permissionId } = req.params;
      await identityService.removePermissionFromRole(roleId, permissionId);
      res.status(200).json({ success: true, message: 'Permission removed from role' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/roles/:roleId/permissions
   * Get permissions for a role
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getRolePermissions(req, res, next) {
    try {
      const { roleId } = req.params;
      const permissions = await identityService.getRolePermissions(roleId);
      res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // USER-ROLE ASSIGNMENT HANDLERS
  // ============================================

  /**
   * POST /api/v1/users/:userId/roles
   * Assign role to user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async assignRoleToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleId } = AssignRoleToUserDTO.parse(req.body);
      const assignment = await identityService.assignRoleToUser(userId, roleId);
      res.status(201).json({ success: true, data: assignment, message: 'Role assigned to user' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users/:userId/roles/bulk
   * Bulk assign roles to user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async bulkAssignRolesToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { roleIds } = BulkAssignRolesToUserDTO.parse(req.body);
      const result = await identityService.bulkAssignRolesToUser(userId, roleIds);
      res.status(201).json({ success: true, data: result, message: 'Roles assigned to user' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:userId/roles/:roleId
   * Remove role from user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async removeRoleFromUser(req, res, next) {
    try {
      const { userId, roleId } = req.params;
      await identityService.removeRoleFromUser(userId, roleId);
      res.status(200).json({ success: true, message: 'Role removed from user' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:userId/roles
   * Get roles for a user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getUserRoles(req, res, next) {
    try {
      const { userId } = req.params;
      const roles = await identityService.getUserRoles(userId);
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/me/roles
   * Get current user roles
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyRoles(req, res, next) {
    try {
      const userId = req.user.id;
      const roles = await identityService.getUserRoles(userId);
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IdentityController();

