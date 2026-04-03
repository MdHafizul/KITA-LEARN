/**
 * Progression & Certificates Repository
 * Prisma queries for StudentProgression and Certificate
 */

const prisma = require('../../../config/database');
const crypto = require('crypto');

class ProgressionCertificatesRepository {
  // ============================================
  // PROGRESSION OPERATIONS
  // ============================================

  /**
   * Get or create student progression
   */
  async getOrCreateProgression(userId) {
    return prisma.studentProgression.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currentLevel: 'BEGINNER',
        totalPoints: 0,
      },
    });
  }

  /**
   * Get progression by user ID
   */
  async getProgressionByUserId(userId) {
    return prisma.studentProgression.findUnique({
      where: { userId },
    });
  }

  /**
   * Get progression by ID
   */
  async getProgressionById(progressionId) {
    return prisma.studentProgression.findUnique({
      where: { id: progressionId },
    });
  }

  /**
   * Update progression
   */
  async updateProgression(userId, data) {
    return prisma.studentProgression.update({
      where: { userId },
      data: {
        ...data,
        lastProgressionDate: data.lastProgressionDate || new Date(),
      },
    });
  }

  /**
   * Award points to user
   */
  async awardPoints(userId, points) {
    const progression = await this.getOrCreateProgression(userId);

    return prisma.studentProgression.update({
      where: { userId },
      data: {
        totalPoints: { increment: points },
        lastProgressionDate: new Date(),
      },
    });
  }

  /**
   * Deduct points from user
   */
  async deductPoints(userId, points) {
    return prisma.studentProgression.update({
      where: { userId },
      data: {
        totalPoints: { increment: -points },
      },
    });
  }

  /**
   * Level up user
   */
  async levelUpUser(userId, newLevel) {
    return prisma.studentProgression.update({
      where: { userId },
      data: {
        currentLevel: newLevel,
        lastProgressionDate: new Date(),
      },
    });
  }

  /**
   * Set next milestone points
   */
  async setNextMilestonePoints(userId, points) {
    return prisma.studentProgression.update({
      where: { userId },
      data: { nextMilestonePoints: points },
    });
  }

  /**
   * Get top students by points
   */
  async getTopStudentsByPoints(limit = 10) {
    return prisma.studentProgression.findMany({
      where: { deletedAt: null },
      orderBy: { totalPoints: 'desc' },
      take: limit,
    });
  }

  /**
   * Get students by level
   */
  async getStudentsByLevel(level, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.studentProgression.findMany({
        where: { currentLevel: level, deletedAt: null },
        skip,
        take: limit,
        orderBy: { totalPoints: 'desc' },
      }),
      prisma.studentProgression.count({
        where: { currentLevel: level, deletedAt: null },
      }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Filter progressions
   */
  async filterProgressions(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.level && { currentLevel: filters.level }),
      ...(filters.minPoints && { totalPoints: { gte: filters.minPoints } }),
      ...(filters.maxPoints && { totalPoints: { lte: filters.maxPoints } }),
    };

    const [data, total] = await Promise.all([
      prisma.studentProgression.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalPoints: 'desc' },
      }),
      prisma.studentProgression.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  // ============================================
  // CERTIFICATE OPERATIONS
  // ============================================

  /**
   * Create certificate
   */
  async createCertificate(data) {
    const verificationCode = crypto.randomBytes(16).toString('hex');

    return prisma.certificate.create({
      data: {
        ...data,
        verificationCode,
      },
    });
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId) {
    return prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  /**
   * Get certificate by certificate number
   */
  async getCertificateByCertificateNumber(certificateNumber) {
    return prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  /**
   * Get certificate by verification code
   */
  async getCertificateByVerificationCode(verificationCode) {
    return prisma.certificate.findUnique({
      where: { verificationCode },
    });
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(certificateId) {
    return prisma.certificate.update({
      where: { id: certificateId },
      data: { isVerified: true },
    });
  }

  /**
   * Update certificate
   */
  async updateCertificate(certificateId, data) {
    return prisma.certificate.update({
      where: { id: certificateId },
      data,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { issuedDate: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      prisma.certificate.count({
        where: { userId, deletedAt: null },
      }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get active certificates (not expired)
   */
  async getActiveCertificates(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
        },
        skip,
        take: limit,
        orderBy: { issuedDate: 'desc' },
      }),
      prisma.certificate.count({
        where: {
          userId,
          deletedAt: null,
          OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
        },
      }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Get expired certificates
   */
  async getExpiredCertificates(userId) {
    const now = new Date();

    return prisma.certificate.findMany({
      where: {
        userId,
        deletedAt: null,
        expiryDate: { lte: now },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }

  /**
   * Count certificates by user
   */
  async countUserCertificates(userId) {
    return prisma.certificate.count({
      where: { userId, deletedAt: null },
    });
  }

  /**
   * Count active certificates by user
   */
  async countActiveCertificates(userId) {
    const now = new Date();

    return prisma.certificate.count({
      where: {
        userId,
        deletedAt: null,
        OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
      },
    });
  }

  /**
   * Filter certificates
   */
  async filterCertificates(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const where = {
      deletedAt: null,
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.courseId && { courseId: filters.courseId }),
      ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
      ...(filters.isExpired === true && { expiryDate: { lte: now } }),
      ...(filters.isExpired === false && {
        OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedDate: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      prisma.certificate.count({ where }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Bulk create certificates
   */
  async bulkCreateCertificates(entries) {
    return prisma.certificate.createMany({
      data: entries.map((entry) => ({
        ...entry,
        verificationCode: crypto.randomBytes(16).toString('hex'),
      })),
    });
  }

  /**
   * Bulk verify certificates
   */
  async bulkVerifyCertificates(certificateIds) {
    return prisma.certificate.updateMany({
      where: { id: { in: certificateIds } },
      data: { isVerified: true },
    });
  }

  /**
   * Delete certificate (soft delete)
   */
  async deleteCertificate(certificateId) {
    return prisma.certificate.update({
      where: { id: certificateId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get certificates by course
   */
  async getCertificatesByCourse(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.certificate.findMany({
        where: { courseId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { issuedDate: 'desc' },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      prisma.certificate.count({
        where: { courseId, deletedAt: null },
      }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }
}

module.exports = new ProgressionCertificatesRepository();
