/**
 * Identity Repository
 * Data access layer for User, Role, Permission, RolePermission, and UserRole entities
 * Handles all Prisma queries with soft delete support
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class IdentityRepository {
  // ============================================
  // USER OPERATIONS
  // ============================================

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Find user by ID (excluding soft deleted)
   */
  async findUserById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Create a new user
   */
  async createUser(data) {
    return prisma.user.create({
      data,
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash, updatedAt: new Date() },
    });
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  /**
   * Lock user account until specified time
   */
  async lockUserAccount(userId, lockedUntil) {
    return prisma.user.update({
      where: { id: userId },
      data: { lockedUntil, failedLoginAttempts: 5 },
    });
  }

  /**
   * Reset failed login attempts and unlock account
   */
  async resetLoginAttempts(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Find multiple users with filtering
   */
  async findUsersWithFilter(filters) {
    const { search, isActive, isEmailVerified, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(isEmailVerified !== undefined && { isEmailVerified }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          roles: {
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Soft delete user
   */
  async deleteUser(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  // ============================================
  // ROLE OPERATIONS
  // ============================================

  /**
   * Create a new role
   */
  async createRole(data) {
    return prisma.role.create({
      data,
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Find role by ID
   */
  async findRoleById(roleId) {
    return prisma.role.findFirst({
      where: {
        id: roleId,
        deletedAt: null,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Find role by name
   */
  async findRoleByName(name) {
    return prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Find all roles (excludes soft deleted)
   */
  async findAllRoles(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where: { deletedAt: null },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.role.count({ where: { deletedAt: null } }),
    ]);
    return { roles, total, page, limit };
  }

  /**
   * Update role
   */
  async updateRole(roleId, data) {
    return prisma.role.update({
      where: { id: roleId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  /**
   * Soft delete role
   */
  async deleteRole(roleId) {
    return prisma.role.update({
      where: { id: roleId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check if role name exists
   */
  async roleNameExists(name) {
    const role = await prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    return !!role;
  }

  // ============================================
  // PERMISSION OPERATIONS
  // ============================================

  /**
   * Create a new permission
   */
  async createPermission(data) {
    return prisma.permission.create({ data });
  }

  /**
   * Find permission by ID
   */
  async findPermissionById(permissionId) {
    return prisma.permission.findFirst({
      where: {
        id: permissionId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find all permissions
   */
  async findAllPermissions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.permission.count({ where: { deletedAt: null } }),
    ]);
    return { permissions, total, page, limit };
  }

  /**
   * Update permission
   */
  async updatePermission(permissionId, data) {
    return prisma.permission.update({
      where: { id: permissionId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Soft delete permission
   */
  async deletePermission(permissionId) {
    return prisma.permission.update({
      where: { id: permissionId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check if permission name exists
   */
  async permissionNameExists(name) {
    const permission = await prisma.permission.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    return !!permission;
  }

  // ============================================
  // ROLE-PERMISSION OPERATIONS
  // ============================================

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId, permissionId) {
    return prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId, permissionId) {
    return prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  /**
   * Check if role has permission
   */
  async roleHasPermission(roleId, permissionId) {
    const assignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });
    return !!assignment;
  }

  // ============================================
  // USER-ROLE OPERATIONS
  // ============================================

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId) {
    return prisma.userRole.create({
      data: { userId, roleId },
    });
  }

  /**
   * Bulk assign roles to user
   */
  async bulkAssignRolesToUser(userId, roleIds) {
    return prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
      skipDuplicates: true,
    });
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId) {
    return prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId) {
    return prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  /**
   * Check if user has role
   */
  async userHasRole(userId, roleId) {
    const assignment = await prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
    return !!assignment;
  }

  /**
   * Check if user has specific role name
   */
  async userHasRoleName(userId, roleName) {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: roleName,
          deletedAt: null,
        },
      },
    });
    return !!userRole;
  }

  /**
   * Get user role names
   */
  async getUserRoleNames(userId) {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  }
}

module.exports = new IdentityRepository();
