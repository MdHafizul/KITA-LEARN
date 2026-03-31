const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email, include = {}) {
    return this.model.findUnique({
      where: { email },
      include,
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username, include = {}) {
    return this.model.findFirst({
      where: { username },
      include,
    });
  }

  /**
   * Get user with all relationships
   */
  async findWithRelations(id) {
    return this.model.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: { include: { permissions: true } } } },
        enrollments: { include: { course: true } },
        submissions: true,
        grades: true,
        certificates: true,
      },
    });
  }

  /**
   * Find all users by role
   */
  async findByRole(roleId, options = {}) {
    return this.findMany(
      {
        userRoles: { some: { roleId } },
      },
      options
    );
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId, permissionName) {
    const user = await this.model.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: { permissions: true },
            },
          },
        },
      },
    });

    if (!user) return false;

    return user.userRoles.some((ur) =>
      ur.role.permissions.some((p) => p.name === permissionName)
    );
  }

  /**
   * Get active users (not deleted)
   */
  async getActiveUsers(options = {}) {
    return this.findMany({ deletedAt: null }, options);
  }
}

module.exports = UserRepository;
