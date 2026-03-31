const BaseRepository = require('./base.repository');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CertificateRepository extends BaseRepository {
  constructor() {
    super(prisma.certificate);
  }

  /**
   * Find certificates by user
   */
  async findByUser(userId, options = {}) {
    return this.findMany(
      { userId },
      { ...options, include: { course: true } }
    );
  }

  /**
   * Find certificates by course
   */
  async findByCourse(courseId, options = {}) {
    return this.findMany(
      { courseId },
      { ...options, include: { user: true } }
    );
  }

  /**
   * Check if certificate is valid
   */
  async isValid(certificateId) {
    const cert = await this.model.findUnique({
      where: { id: certificateId },
    });

    if (!cert) return false;

    if (cert.expiresAt && cert.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Verify certificate by code
   */
  async verifyByCode(certificateCode) {
    const cert = await this.model.findFirst({
      where: { certificateCode },
      include: { user: true, course: true },
    });

    if (!cert || !this.isValid(cert.id)) {
      return null;
    }

    return cert;
  }

  /**
   * Get active certificates
   */
  async getActive(options = {}) {
    const now = new Date();

    return this.findMany(
      {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      options
    );
  }

  /**
   * Generate unique certificate code
   */
  async generateUniqueCode() {
    let code;
    let exists = true;

    while (exists) {
      code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const existing = await this.model.findFirst({
        where: { certificateCode: code },
      });
      exists = !!existing;
    }

    return code;
  }

  /**
   * Get certificates expiring soon
   */
  async getExpiringSoon(daysAhead = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.findMany({
      expiresAt: {
        gte: now,
        lte: futureDate,
      },
    });
  }
}

module.exports = CertificateRepository;
