/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * Progression & Certificates Controller
 * HTTP request/response handlers for Progression & Certificates domain
 */

const progressionCertificatesService = require('../services/progression-certificates.service');
const {
  AwardPointsDTO,
  LevelUpDTO,
  CertificateCreateDTO,
  CertificateUpdateDTO,
  CertificateFilterDTO,
  VerifyCertificateDTO,
  BulkCertificateCreateDTO,
  StudentProgressionFilterDTO,
} = require('../dtos/progression-certificates.dtos');

class ProgressionCertificatesController {
  // ============================================
  // PROGRESSION HANDLERS
  // ============================================

  /**
   * GET /api/v1/progression/me
   * Get current user's progression
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyProgression(req, res, next) {
    try {
      const userId = req.user.id;
      const progression = await progressionCertificatesService.getStudentProgression(userId);
      res.status(200).json({ success: true, data: progression });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progression/me/summary
   * Get current user's progression summary
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyProgressionSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const summary = await progressionCertificatesService.getProgressionSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/progression/:userId/award-points
   * Award points to user (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async awardPoints(req, res, next) {
    try {
      const { userId } = req.params;
      const { points, reason } = AwardPointsDTO.parse(req.body);

      const progression = await progressionCertificatesService.awardPoints(userId, points, reason);
      res.status(200).json({ success: true, data: progression, message: 'Points awarded' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/progression/:userId/level-up
   * Level up user (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async levelUpUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { newLevel } = LevelUpDTO.parse(req.body);

      const progression = await progressionCertificatesService.levelUpStudent(userId, newLevel);
      res.status(200).json({ success: true, data: progression, message: 'User leveled up' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progression/leaderboard
   * Get progression leaderboard
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getProgressionLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const leaderboard = await progressionCertificatesService.getProgressionLeaderboard(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progression/students/level/:level
   * Get students by level
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getStudentsByLevel(req, res, next) {
    try {
      const { level } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await progressionCertificatesService.getStudentsByLevel(level, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progression/filter
   * Filter progressions (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async filterProgressions(req, res, next) {
    try {
      const filters = StudentProgressionFilterDTO.partial().parse(req.query);
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;

      const result = await progressionCertificatesService.filterProgressions(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CERTIFICATE HANDLERS
  // ============================================

  /**
   * POST /api/v1/certificates
   * Issue certificate to user (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async issueCertificate(req, res, next) {
    try {
      const certData = CertificateCreateDTO.parse(req.body);
      const certificate = await progressionCertificatesService.issueCertificate(
        certData.userId,
        certData
      );
      res.status(201).json({ success: true, data: certificate, message: 'Certificate issued' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/certificates/me
   * Get current user's certificates
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyCertificates(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await progressionCertificatesService.getUserCertificates(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/certificates/me/active
   * Get current user's active certificates
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyActiveCertificates(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await progressionCertificatesService.getActiveCertificates(
        userId,
        page,
        limit
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/certificates/:certificateId
   * Get certificate by ID
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getCertificateById(req, res, next) {
    try {
      const { certificateId } = req.params;
      const certificate = await progressionCertificatesService.getCertificateById(certificateId);
      res.status(200).json({ success: true, data: certificate });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/certificates/:certificateId
   * Update certificate (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const updateData = CertificateUpdateDTO.parse(req.body);

      const certificate = await progressionCertificatesService.updateCertificate(
        certificateId,
        updateData
      );
      res.status(200).json({ success: true, data: certificate, message: 'Certificate updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/certificates/:certificateId
   * Delete certificate (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async deleteCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      await progressionCertificatesService.deleteCertificate(certificateId);
      res.status(200).json({ success: true, message: 'Certificate deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/certificates/verify
   * Verify certificate
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async verifyCertificate(req, res, next) {
    try {
      const { certificateNumber, verificationCode } = VerifyCertificateDTO.parse(req.body);

      const result = await progressionCertificatesService.validateCertificate(
        certificateNumber,
        verificationCode
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/certificates
   * Filter certificates (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async filterCertificates(req, res, next) {
    try {
      const filters = CertificateFilterDTO.partial().parse(req.query);
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;

      const result = await progressionCertificatesService.filterCertificates(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/certificates/course/:courseId
   * Get certificates by course
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getCertificatesByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await progressionCertificatesService.getCertificatesByCourse(
        courseId,
        page,
        limit
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/certificates/bulk
   * Bulk issue certificates (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async bulkIssueCertificates(req, res, next) {
    try {
      const { certificates } = BulkCertificateCreateDTO.parse(req.body);
      const result = await progressionCertificatesService.bulkIssueCertificates(certificates);
      res
        .status(201)
        .json({ success: true, data: result, message: 'Certificates bulk issued' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progress/me/achievements
   * Get current user's achievement summary
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      const summary = await progressionCertificatesService.getStudentAchievementSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/progress/:userId/achievements
   * Get user's achievement summary (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getUserAchievements(req, res, next) {
    try {
      const { userId } = req.params;
      const summary = await progressionCertificatesService.getStudentAchievementSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgressionCertificatesController();

