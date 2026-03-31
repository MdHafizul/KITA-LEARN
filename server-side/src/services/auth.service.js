const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { ValidationException, AuthException } = require('../exceptions');

const prisma = new PrismaClient();

class AuthService {
  /**
   * Register a new user
   */
  async register(data) {
    const { email, password, full_name, phone_number, role } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ValidationException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: true
      }
    });

    if (!user) {
      throw new AuthException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
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
    try {
      const decoded = verifyToken(refreshToken, 'refresh');

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
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number,
      status: user.status,
      roles: user.roles,
      created_at: user.created_at
    };
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Update profile
   */
  async updateProfile(userId, data) {
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
      id: updated.id,
      email: updated.email,
      full_name: updated.full_name,
      phone_number: updated.phone_number
    };
  }
}

module.exports = new AuthService();
