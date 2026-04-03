/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Identity Service
 * Business logic layer for User, Role, Permission operations
 * Handles authentication, authorization, password hashing
 */

const identityRepository = require('../repositories/identity.repository');
const { generateAccessToken, generateRefreshToken } = require('../../../utils/jwt');
const bcrypt = require('bcrypt');

class IdentityService {
  // ============================================
  // USER AUTHENTICATION OPERATIONS
  // ============================================

  /**
   * Register a new user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async registerUser(data) {
    // Check if email already exists
    const emailExists = await identityRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await identityRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      password: passwordHash,
      phoneNumber: data.phoneNumber || null,
      isActive: true,
      isEmailVerified: false,
      failedLoginAttempts: 0,
    });

    // Assign default STUDENT role
    await identityRepository.assignRoleToUser(user.id, process.env.DEFAULT_STUDENT_ROLE_ID || 'student-role-id');

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      message: 'User registered successfully. Please verify your email.',
    };
  }

  /**
   * Authenticate user login
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async loginUser(email, password) {
    // Find user by email
    const user = await identityRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new Error('Account is locked. Try again later.');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Increment failed login attempts
      await identityRepository.incrementFailedLoginAttempts(user.id);

      // Lock account if attempts exceed limit
      if (user.failedLoginAttempts >= 4) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await identityRepository.lockUserAccount(user.id, lockedUntil);
      }

      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    await identityRepository.resetLoginAttempts(user.id);
    await identityRepository.updateLastLogin(user.id);

    // Get primary role (first role or default to USER)
    const primaryRole = user.roles && user.roles.length > 0
      ? user.roles[0].role.name
      : 'USER';

    // Generate JWT tokens with correct payload structure
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: primaryRole
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: primaryRole,
        roles: user.roles.map((ur) => ur.role.name),
      },
    };
  }

  /**
   * Change user password
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await identityRepository.updateUserPassword(userId, newPasswordHash);

    return { message: 'Password changed successfully' };
  }

  /**
   * Verify user email
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async verifyEmail(userId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    await identityRepository.verifyUserEmail(userId);
    return { message: 'Email verified successfully' };
  }

  // ============================================
  // USER PROFILE OPERATIONS
  // ============================================

  /**
   * Get current user profile
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUserProfile(userId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateUserProfile(userId, data) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return identityRepository.updateUser(userId, data);
  }

  /**
   * Get user by ID
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUserById(userId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Filter users (Admin-only)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async filterUsers(filters) {
    return identityRepository.findUsersWithFilter(filters);
  }

  /**
   * Delete user (Admin-only)
   */
  async deleteUser(userId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return identityRepository.deleteUser(userId);
  }

  // ============================================
  // ROLE OPERATIONS (Admin-only)
  // ============================================

  /**
   * Create a new role
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async createRole(data) {
    // Check if role name already exists
    const roleExists = await identityRepository.roleNameExists(data.name);
    if (roleExists) {
      throw new Error('Role name already exists');
    }

    return identityRepository.createRole(data);
  }

  /**
   * Get role by ID
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getRoleById(roleId) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  /**
   * Get all roles
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getAllRoles(page, limit) {
    return identityRepository.findAllRoles(page, limit);
  }

  /**
   * Update role
   */
  async updateRole(roleId, data) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return identityRepository.updateRole(roleId, data);
  }

  /**
   * Delete role
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async deleteRole(roleId) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return identityRepository.deleteRole(roleId);
  }

  // ============================================
  // PERMISSION OPERATIONS (Admin-only)
  // ============================================

  /**
   * Create a new permission
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async createPermission(data) {
    // Check if permission name already exists
    const permissionExists = await identityRepository.permissionNameExists(data.name);
    if (permissionExists) {
      throw new Error('Permission name already exists');
    }

    return identityRepository.createPermission(data);
  }

  /**
   * Get all permissions
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getAllPermissions(page, limit) {
    return identityRepository.findAllPermissions(page, limit);
  }

  /**
   * Update permission
   */
  async updatePermission(permissionId, data) {
    const permission = await identityRepository.findPermissionById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return identityRepository.updatePermission(permissionId, data);
  }

  /**
   * Delete permission
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async deletePermission(permissionId) {
    const permission = await identityRepository.findPermissionById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return identityRepository.deletePermission(permissionId);
  }

  // ============================================
  // ROLE-PERMISSION ASSIGNMENT
  // ============================================

  /**
   * Assign permission to role
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async assignPermissionToRole(roleId, permissionId) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = await identityRepository.findPermissionById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if already assigned
    const hasPermission = await identityRepository.roleHasPermission(roleId, permissionId);
    if (hasPermission) {
      throw new Error('Permission is already assigned to this role');
    }

    return identityRepository.assignPermissionToRole(roleId, permissionId);
  }

  /**
   * Remove permission from role
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async removePermissionFromRole(roleId, permissionId) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return identityRepository.removePermissionFromRole(roleId, permissionId);
  }

  /**
   * Get role permissions
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getRolePermissions(roleId) {
    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    return identityRepository.getRolePermissions(roleId);
  }

  // ============================================
  // USER-ROLE ASSIGNMENT
  // ============================================

  /**
   * Assign role to user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async assignRoleToUser(userId, roleId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await identityRepository.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if already assigned
    const hasRole = await identityRepository.userHasRole(userId, roleId);
    if (hasRole) {
      throw new Error('User already has this role');
    }

    return identityRepository.assignRoleToUser(userId, roleId);
  }

  /**
   * Bulk assign roles to user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async bulkAssignRolesToUser(userId, roleIds) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return identityRepository.bulkAssignRolesToUser(userId, roleIds);
  }

  /**
   * Remove role from user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async removeRoleFromUser(userId, roleId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return identityRepository.removeRoleFromUser(userId, roleId);
  }

  /**
   * Get user roles
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUserRoles(userId) {
    const user = await identityRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return identityRepository.getUserRoles(userId);
  }

  /**
   * Check if user has permission (through roles)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async userHasPermission(userId, permissionName) {
    const userRoleNames = await identityRepository.getUserRoleNames(userId);

    // Check each role for the permission
    for (const roleName of userRoleNames) {
      const role = await identityRepository.findRoleByName(roleName);
      if (role) {
        const hasPermission = role.permissions.some((rp) => rp.permission.name === permissionName);
        if (hasPermission) return true;
      }
    }

    return false;
  }
}

module.exports = new IdentityService();

