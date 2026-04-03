/**
 * Documentation Contract (Professional Node.js)
 * Desc: Controller handlers receive validated HTTP input and return consistent JSON responses.
 * Params: Read from req.params and req.query; validate and sanitize before passing to services.
 * Body: Read from req.body using DTO/schema validation before business logic execution.
 * Auth Headers: Expect Authorization: Bearer <token> when route is protected; enforce role checks in routes/middleware.
 */

/**
 * SLT Tracking Controller
 * HTTP request/response handlers for SLT Tracking domain
 */

const sltTrackingService = require('../services/slt-tracking.service');
const {
  ActivityTrackingCreateDTO,
  ActivityTrackingUpdateDTO,
  ActivityTrackingFilterDTO,
  BulkActivityTrackingDTO,
  UpdateActivityProgressDTO,
  StudentSltSummaryFilterDTO,
  UpdateSltSummaryDTO,
} = require('../dtos/slt-tracking.dtos');

class SltTrackingController {
  // ============================================
  // ACTIVITY TRACKING HANDLERS
  // ============================================

  /**
   * POST /api/v1/tracking/activities/start
   * Start tracking an activity for user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async startActivityTracking(req, res, next) {
    try {
      const userId = req.user.id;
      const { activityId } = ActivityTrackingCreateDTO.partial().parse(req.body);

      if (!activityId) {
        return res.status(400).json({ success: false, error: 'Activity ID is required' });
      }

      const tracking = await sltTrackingService.startActivityTracking(userId, activityId);
      res
        .status(201)
        .json({ success: true, data: tracking, message: 'Activity tracking started' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/tracking/activities/:activityId/complete
   * Mark activity as completed
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async completeActivity(req, res, next) {
    try {
      const userId = req.user.id;
      const { activityId } = req.params;
      const { timeSpentMinutes } = req.body;

      const tracking = await sltTrackingService.completeActivity(
        userId,
        activityId,
        timeSpentMinutes || 0
      );
      res.status(200).json({ success: true, data: tracking, message: 'Activity completed' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/tracking/activities/:activityId/progress
   * Update activity progress
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateActivityProgress(req, res, next) {
    try {
      const userId = req.user.id;
      const { activityId } = req.params;
      const progressData = UpdateActivityProgressDTO.parse(req.body);

      const tracking = await sltTrackingService.updateActivityProgress(
        userId,
        activityId,
        progressData
      );
      res.status(200).json({ success: true, data: tracking, message: 'Progress updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/activities
   * Get user's activity trackings with filters
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getUserActivityTrackings(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = ActivityTrackingFilterDTO.partial().parse(req.query);
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;

      const result = await sltTrackingService.getUserActivityTrackings(userId, filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/activities/completed
   * Get completed activities for user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getCompletedActivities(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await sltTrackingService.getCompletedActivities(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/activities/pending
   * Get pending activities for user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getPendingActivities(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await sltTrackingService.getPendingActivities(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/activities/in-progress
   * Get in-progress activities for user
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getInProgressActivities(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await sltTrackingService.getInProgressActivities(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/activities/stats
   * Get activity tracking statistics
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getActivityStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await sltTrackingService.getActivityTrackingStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/tracking/activities/bulk
   * Bulk create activity trackings
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async bulkTrackActivities(req, res, next) {
    try {
      const { entries } = BulkActivityTrackingDTO.parse(req.body);
      const result = await sltTrackingService.bulkTrackActivities(entries);
      res
        .status(201)
        .json({ success: true, data: result, message: 'Activities bulk tracked' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // SLT SUMMARY HANDLERS
  // ============================================

  /**
   * GET /api/v1/tracking/summary/me
   * Get current user's SLT summary
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyLearningTrajectory(req, res, next) {
    try {
      const userId = req.user.id;
      const summary = await sltTrackingService.getSltSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/metrics/me
   * Get current user's learning metrics
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getMyMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const metrics = await sltTrackingService.getStudentMetrics(userId);
      res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/tracking/summary/me
   * Update current user's SLT summary
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateMySummary(req, res, next) {
    try {
      const userId = req.user.id;
      const data = UpdateSltSummaryDTO.parse(req.body);
      const summary = await sltTrackingService.updateSltSummary(userId, data);
      res.status(200).json({ success: true, data: summary, message: 'Summary updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/tracking/summary/:userId/course-enrollment
   * Record course enrollment (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async recordCourseEnrollment(req, res, next) {
    try {
      const { userId } = req.params;
      const summary = await sltTrackingService.recordCourseEnrollment(userId);
      res
        .status(200)
        .json({ success: true, data: summary, message: 'Course enrollment recorded' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/tracking/summary/:userId/course-completion
   * Record course completion (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async recordCourseCompletion(req, res, next) {
    try {
      const { userId } = req.params;
      const summary = await sltTrackingService.recordCourseCompletion(userId);
      res
        .status(200)
        .json({ success: true, data: summary, message: 'Course completion recorded' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/tracking/summary/:userId/certificate
   * Record certificate earned (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async recordCertificateEarned(req, res, next) {
    try {
      const { userId } = req.params;
      const summary = await sltTrackingService.recordCertificateEarned(userId);
      res
        .status(200)
        .json({ success: true, data: summary, message: 'Certificate recorded' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/tracking/summary/:userId/score
   * Update user's average score (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async updateUserScore(req, res, next) {
    try {
      const { userId } = req.params;
      const { score } = req.body;

      if (score === undefined || score === null) {
        return res.status(400).json({ success: false, error: 'Score is required' });
      }

      const summary = await sltTrackingService.updateStudentScore(userId, score);
      res.status(200).json({ success: true, data: summary, message: 'Score updated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/leaderboard/completion
   * Get leaderboard by course completion
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getCompletionLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const leaderboard = await sltTrackingService.getLeaderboardByCompletion(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/leaderboard/certificates
   * Get leaderboard by certificates earned
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getCertificateLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const leaderboard = await sltTrackingService.getLeaderboardByCertificates(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/leaderboard/hours
   * Get leaderboard by hours learned
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getHoursLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const leaderboard = await sltTrackingService.getLeaderboardByHours(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/leaderboard/score
   * Get leaderboard by average score
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async getScoreLeaderboard(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const leaderboard = await sltTrackingService.getLeaderboardByScore(limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tracking/summaries
   * Filter SLT summaries (Admin)
   */
/**
 * Desc: Controller function orchestrates request handling and JSON response mapping.
 * Params: Read required path/query values from req.params and req.query.
 * Body: Read request payload from req.body and validate via DTO/Zod before service call.
 * Auth Headers: Use Authorization: Bearer <token> on protected routes; role checks are enforced in middleware.
 */
  async filterSummaries(req, res, next) {
    try {
      const filters = StudentSltSummaryFilterDTO.partial().parse(req.query);
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;

      const result = await sltTrackingService.filterSltSummaries(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SltTrackingController();

