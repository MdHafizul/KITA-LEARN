const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');
const { getPrismaClient } = require('../config/database');
const { ValidationException, AuthException } = require('../exceptions');

class AuthService {
  /**
   * Register a new user
   */
  async register(data) {
    const prisma = getPrismaClient();
    const { email, password, full_name, phone_number, role } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ValidationException('Email already registered');
    }

    // Hash password using utility
    const hashedPassword = await hashPassword(password);

    // Get role ID using 'name' field (not 'slug')
    const roleRecord = await prisma.role.findUnique({
      where: { name: role || 'student' }
    });

    if (!roleRecord) {
      throw new ValidationException('Invalid role');
    }

    // Create user with correct field names (camelCase)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: full_name,  // ← Correct field name
        phoneNumber: phone_number,  // ← Correct field name
        isActive: true  // ← Correct field (boolean, not status)
      }
    });

    // Assign role using proper UserRole relation
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleRecord.id
      }
    });

    // Generate tokens
    const access_token = generateAccessToken({ userId: user.id, email: user.email });
    const refresh_token = generateRefreshToken({ userId: user.id });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: role || 'student'
      },
      access_token,
      refresh_token,
      expires_in: 3600
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new AuthException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthException('Invalid credentials');
    }

    if (!user.isActive) {  // ← Changed from user.status
      throw new AuthException('Account is inactive');
    }

    // Get user role
    const userRole = user.roles[0]?.role?.name || 'student';

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const access_token = generateAccessToken({ userId: user.id, email: user.email, role: userRole });
    const refresh_token = generateRefreshToken({ userId: user.id });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,  // ← Changed from full_name
        role: userRole
      },
      access_token,
      refresh_token,
      expires_in: 3600
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const prisma = getPrismaClient();
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          roles: {
            include: { role: true }
          }
        }
      });

      if (!user || !user.isActive) {  // ← Changed from user.status
        throw new AuthException('User not found or inactive');
      }

      const userRole = user.roles[0]?.role?.name || 'student';
      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: userRole });

      return {
        success: true,
        access_token: newAccessToken,
        expires_in: 3600
      };
    } catch (error) {
      throw new AuthException('Invalid refresh token');
    }
  }

  /**
   * Get user details
   */
  async getUserDetails(userId) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new ValidationException('User not found');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,  // ← Changed from full_name
        phoneNumber: user.phoneNumber,  // ← Changed from phone_number
        isActive: user.isActive,  // ← Changed from status
        roles: user.roles.map(ur => ur.role.name),
        createdAt: user.createdAt  // ← Changed from created_at
      }
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationException('User not found');
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthException('Current password is incorrect');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Update profile
   */
  async updateProfile(userId, data) {
    const prisma = getPrismaClient();
    const { full_name, phone_number } = data;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: full_name,  // ← Changed from full_name
        phoneNumber: phone_number,  // ← Changed from phone_number
        updatedAt: new Date()  // ← Changed from updated_at
      }
    });

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,  // ← Changed from full_name
        phoneNumber: updated.phoneNumber  // ← Changed from phone_number
      }
    };
  }
}

module.exports = new AuthService();
