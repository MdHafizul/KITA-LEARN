/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * Progression & Certificates Service
 * Business logic for student progression, levels, and certificates
 */

const progressionCertificatesRepository = require('../repositories/progression-certificates.repository');

class ProgressionCertificatesService {
  // ============================================
  // PROGRESSION OPERATIONS
  // ============================================

  /**
   * Get student progression
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getStudentProgression(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return progressionCertificatesRepository.getOrCreateProgression(userId);
  }

  /**
   * Award points to student
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async awardPoints(userId, points, reason = '') {
    if (!userId || points <= 0) {
      throw new Error('Valid user ID and positive points are required');
    }

    const progression = await progressionCertificatesRepository.awardPoints(userId, points);

    // Check if student should level up
    const levelUpPoints = {
      BEGINNER: 100,
      INTERMEDIATE: 250,
      ADVANCED: 500,
    };

    if (
      progression.currentLevel === 'BEGINNER' &&
      progression.totalPoints >= levelUpPoints.BEGINNER
    ) {
      await this.levelUpStudent(userId, 'INTERMEDIATE');
    } else if (
      progression.currentLevel === 'INTERMEDIATE' &&
      progression.totalPoints >= levelUpPoints.INTERMEDIATE
    ) {
      await this.levelUpStudent(userId, 'ADVANCED');
    } else if (
      progression.currentLevel === 'ADVANCED' &&
      progression.totalPoints >= levelUpPoints.ADVANCED
    ) {
      await this.levelUpStudent(userId, 'EXPERT');
    }

    return progression;
  }

  /**
   * Level up student
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async levelUpStudent(userId, newLevel) {
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

    if (!validLevels.includes(newLevel)) {
      throw new Error('Invalid level. Must be BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT');
    }

    return progressionCertificatesRepository.levelUpUser(userId, newLevel);
  }

  /**
   * Get progression leaderboard
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getProgressionLeaderboard(limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    return progressionCertificatesRepository.getTopStudentsByPoints(limit);
  }

  /**
   * Get students by level
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getStudentsByLevel(level, page = 1, limit = 10) {
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

    if (!validLevels.includes(level)) {
      throw new Error('Invalid level');
    }

    return progressionCertificatesRepository.getStudentsByLevel(level, page, limit);
  }

  /**
   * Filter progressions
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async filterProgressions(filters = {}, page = 1, limit = 10) {
    return progressionCertificatesRepository.filterProgressions(filters, page, limit);
  }

  /**
   * Get student progression summary
   */
  async getProgressionSummary(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const progression = await this.getStudentProgression(userId);
    const certCount = await progressionCertificatesRepository.countUserCertificates(userId);
    const activeCertCount = await progressionCertificatesRepository.countActiveCertificates(userId);

    const levelUpPoints = {
      BEGINNER: 100,
      INTERMEDIATE: 250,
      ADVANCED: 500,
      EXPERT: 1000,
    };

    const nextLevel = {
      BEGINNER: 'INTERMEDIATE',
      INTERMEDIATE: 'ADVANCED',
      ADVANCED: 'EXPERT',
      EXPERT: null,
    };

    const nextLevelPoints = levelUpPoints[nextLevel[progression.currentLevel]];
    const pointsToNextLevel = nextLevelPoints ? nextLevelPoints - progression.totalPoints : null;
    const progressPercentage = nextLevelPoints
      ? Math.round((progression.totalPoints / nextLevelPoints) * 100)
      : 100;

    return {
      userId,
      currentLevel: progression.currentLevel,
      totalPoints: progression.totalPoints,
      certificatesEarned: certCount,
      certificatesActive: activeCertCount,
      nextLevel: nextLevel[progression.currentLevel],
      nextLevelPoints,
      pointsToNextLevel: pointsToNextLevel > 0 ? pointsToNextLevel : 0,
      progressPercentage: Math.min(progressPercentage, 100),
      lastProgressionDate: progression.lastProgressionDate,
      createdAt: progression.createdAt,
    };
  }

  // ============================================
  // CERTIFICATE OPERATIONS
  // ============================================

  /**
   * Issue certificate to student
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async issueCertificate(userId, certificateData) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!certificateData.certificateNumber) {
      throw new Error('Certificate number is required');
    }

    // Check for duplicate certificate number
    const existing = await progressionCertificatesRepository.getCertificateByCertificateNumber(
      certificateData.certificateNumber
    );

    if (existing) {
      throw new Error('Certificate with this number already exists');
    }

    return progressionCertificatesRepository.createCertificate({
      userId,
      ...certificateData,
    });
  }

  /**
   * Get user certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUserCertificates(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return progressionCertificatesRepository.getUserCertificates(userId, page, limit);
  }

  /**
   * Get active user certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getActiveCertificates(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return progressionCertificatesRepository.getActiveCertificates(userId, page, limit);
  }

  /**
   * Verify certificate against verification code
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async verifyCertificateCode(certificateNumber, verificationCode) {
    if (!certificateNumber || !verificationCode) {
      throw new Error('Certificate number and verification code are required');
    }

    const certificate = await progressionCertificatesRepository.getCertificateByCertificateNumber(
      certificateNumber
    );

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    if (certificate.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }

    // Check expiration
    if (certificate.expiryDate && new Date() > certificate.expiryDate) {
      return {
        valid: false,
        reason: 'Certificate has expired',
        certificate,
      };
    }

    return {
      valid: true,
      certificate,
    };
  }

  /**
   * Get certificate by ID
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getCertificateById(certificateId) {
    if (!certificateId) {
      throw new Error('Certificate ID is required');
    }

    const certificate = await progressionCertificatesRepository.getCertificateById(certificateId);

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    return certificate;
  }

  /**
   * Update certificate
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateCertificate(certificateId, updateData) {
    if (!certificateId) {
      throw new Error('Certificate ID is required');
    }

    return progressionCertificatesRepository.updateCertificate(certificateId, updateData);
  }

  /**
   * Delete certificate (soft delete)
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async deleteCertificate(certificateId) {
    if (!certificateId) {
      throw new Error('Certificate ID is required');
    }

    return progressionCertificatesRepository.deleteCertificate(certificateId);
  }

  /**
   * Filter certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async filterCertificates(filters = {}, page = 1, limit = 10) {
    return progressionCertificatesRepository.filterCertificates(filters, page, limit);
  }

  /**
   * Get certificates by course
   */
  async getCertificatesByCourse(courseId, page = 1, limit = 10) {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    return progressionCertificatesRepository.getCertificatesByCourse(courseId, page, limit);
  }

  /**
   * Bulk issue certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async bulkIssueCertificates(certificateEntries) {
    if (!Array.isArray(certificateEntries) || certificateEntries.length === 0) {
      throw new Error('At least one certificate entry is required');
    }

    return progressionCertificatesRepository.bulkCreateCertificates(certificateEntries);
  }

  /**
   * Verify multiple certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async bulkVerifyCertificates(certificateIds) {
    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      throw new Error('At least one certificate ID is required');
    }

    return progressionCertificatesRepository.bulkVerifyCertificates(certificateIds);
  }

  /**
   * Get achievement summary for student
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getStudentAchievementSummary(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const progression = await this.getProgressionSummary(userId);
    const certificates = await this.getUserCertificates(userId, 1, 100);
    const activeCerts = await this.getActiveCertificates(userId, 1, 100);

    return {
      userId,
      progression,
      certificateCounts: {
        total: certificates.total,
        active: activeCerts.total,
        expired: certificates.total - activeCerts.total,
      },
      achievements: {
        level: progression.currentLevel,
        points: progression.totalPoints,
        certificates: certificates.total,
      },
      recentActivity: {
        lastProgressionUpdate: progression.lastProgressionDate,
        totalCertificatesIssued: certificates.total,
      },
    };
  }

  /**
   * Check if certificate is valid
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async validateCertificate(certificateNumber, verificationCode) {
    const result = await this.verifyCertificateCode(certificateNumber, verificationCode);

    if (!result.valid) {
      return {
        isValid: false,
        reason: result.reason,
      };
    }

    return {
      isValid: true,
      certificateNumber: result.certificate.certificateNumber,
      issuedDate: result.certificate.issuedDate,
      certificateId: result.certificate.id,
    };
  }
}

module.exports = new ProgressionCertificatesService();

