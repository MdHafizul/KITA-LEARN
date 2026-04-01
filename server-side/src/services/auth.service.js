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

    // Get role ID
    const roleRecord = await prisma.role.findUnique({
      where: { slug: role || 'student' }
    });

    if (!roleRecord) {
      throw new ValidationException('Invalid role');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        full_name,
        phone_number,
        status: 'active'
      }
    });

    // Assign role
    await prisma.$executeRaw`INSERT INTO model_has_roles (role_id, model_id, model_type) VALUES (${roleRecord.id}, ${user.id}, 'User')`;

    // Generate tokens
    const access_token = generateAccessToken({ userId: user.id, email: user.email });
    const refresh_token = generateRefreshToken({ userId: user.id });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
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
        roles: true
      }
    });

    if (!user) {
      throw new AuthException('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthException('Invalid credentials');
    }

    if (user.status === 'inactive') {
      throw new AuthException('Account is inactive');
    }

    // Get user role
    const userRole = user.roles[0]?.slug || 'student';

    const access_token = generateAccessToken({ userId: user.id, email: user.email, role: userRole });
    const refresh_token = generateRefreshToken({ userId: user.id });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
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
        include: { roles: true }
      });

      if (!user || user.status === 'inactive') {
        throw new AuthException('User not found or inactive');
      }

      const userRole = user.roles[0]?.slug || 'student';
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
          include: { permissions: true }
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
        full_name: user.full_name,
        phone_number: user.phone_number,
        status: user.status,
        roles: user.roles,
        created_at: user.created_at
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
        full_name,
        phone_number,
        updated_at: new Date()
      }
    });

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        phone_number: updated.phone_number
      }
    };
  }
}

module.exports = new AuthService();
