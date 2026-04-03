/**
 * Documentation Contract (Professional Node.js)
 * Desc: Service layer contains business rules, orchestrates repositories, and throws domain-specific errors.
 * Params: Accept explicit method arguments (ids, filters, payload objects) from controllers.
 * Body: N/A at transport level; use validated payload objects received from controller layer.
 * Auth Headers: N/A at service level; authorization is enforced at route/controller boundary before service calls.
 */

/**
 * SLT Tracking Service
 * Business logic for student learning trajectory tracking
 */

const sltTrackingRepository = require('../repositories/slt-tracking.repository');

class SltTrackingService {
  // ============================================
  // ACTIVITY TRACKING OPERATIONS
  // ============================================

  /**
   * Track user starting an activity
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async startActivityTracking(userId, activityId) {
    // Check if already tracking
    let tracking = await sltTrackingRepository.getActivityTrackingByUserActivity(userId, activityId);

    if (tracking) {
      // Update existing tracking
      return sltTrackingRepository.updateActivityTracking(tracking.id, {
        completionStatus: 'IN_PROGRESS',
        viewCount: tracking.viewCount + 1,
      });
    }

    // Create new tracking
    return sltTrackingRepository.createActivityTracking({
      userId,
      activityId,
      completionStatus: 'IN_PROGRESS',
      viewCount: 1,
    });
  }

  /**
   * Mark activity as completed
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async completeActivity(userId, activityId, timeSpentMinutes = 0) {
    let tracking = await sltTrackingRepository.getActivityTrackingByUserActivity(userId, activityId);

    if (!tracking) {
      throw new Error('Activity tracking not found for this user');
    }

    const updatedTracking = await sltTrackingRepository.updateActivityTracking(tracking.id, {
      completionStatus: 'COMPLETED',
      timeSpentMinutes,
    });

    // Update user SLT summary with hours
    const hours = Math.ceil(timeSpentMinutes / 60);
    if (hours > 0) {
      await sltTrackingRepository.addHoursLearned(userId, hours);
    }

    // Update last activity date
    await sltTrackingRepository.updateLastActivityDate(userId);

    return updatedTracking;
  }

  /**
   * Update activity progress
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateActivityProgress(userId, activityId, progressData) {
    let tracking = await sltTrackingRepository.getActivityTrackingByUserActivity(userId, activityId);

    if (!tracking) {
      // Create new tracking if doesn't exist
      tracking = await sltTrackingRepository.createActivityTracking({
        userId,
        activityId,
        completionStatus: progressData.completionStatus || 'IN_PROGRESS',
        timeSpentMinutes: progressData.timeSpentMinutes || 0,
      });
    }

    const updated = await sltTrackingRepository.updateActivityTracking(tracking.id, {
      completionStatus: progressData.completionStatus,
      timeSpentMinutes: progressData.timeSpentMinutes || tracking.timeSpentMinutes,
    });

    // Update summary if marked complete
    if (progressData.completionStatus === 'COMPLETED') {
      const hours = Math.ceil((progressData.timeSpentMinutes || tracking.timeSpentMinutes) / 60);
      if (hours > 0) {
        await sltTrackingRepository.addHoursLearned(userId, hours);
      }
      await sltTrackingRepository.updateLastActivityDate(userId);
    }

    return updated;
  }

  /**
   * Get user's activity tracking with filters
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getUserActivityTrackings(userId, filters = {}, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return sltTrackingRepository.getUserActivityTrackings(userId, filters, page, limit);
  }

  /**
   * Get completed activities for user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getCompletedActivities(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return sltTrackingRepository.getCompletedActivities(userId, page, limit);
  }

  /**
   * Get pending activities for user
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getPendingActivities(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const result = await sltTrackingRepository.getUserActivityTrackings(
      userId,
      { completionStatus: 'NOT_STARTED' },
      page,
      limit
    );

    return result;
  }

  /**
   * Get in-progress activities
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getInProgressActivities(userId, page = 1, limit = 10) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const result = await sltTrackingRepository.getUserActivityTrackings(
      userId,
      { completionStatus: 'IN_PROGRESS' },
      page,
      limit
    );

    return result;
  }

  /**
   * Get activity tracking stats
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getActivityTrackingStats(userId) {
    const completedActivities = await sltTrackingRepository.getActivitiesByStatus(
      userId,
      'COMPLETED'
    );
    const inProgressActivities = await sltTrackingRepository.getActivitiesByStatus(
      userId,
      'IN_PROGRESS'
    );
    const notStartedActivities = await sltTrackingRepository.getActivitiesByStatus(
      userId,
      'NOT_STARTED'
    );

    const totalTimeSpent = completedActivities.reduce((sum, a) => sum + a.timeSpentMinutes, 0);

    return {
      completedCount: completedActivities.length,
      inProgressCount: inProgressActivities.length,
      notStartedCount: notStartedActivities.length,
      completionRate: ((completedActivities.length /
        (completedActivities.length + inProgressActivities.length + notStartedActivities.length)) *
        100) || 0,
      totalTimeSpentMinutes: totalTimeSpent,
      totalTimeSpentHours: Math.ceil(totalTimeSpent / 60),
    };
  }

  // ============================================
  // SLT SUMMARY OPERATIONS
  // ============================================

  /**
   * Get or create student SLT summary
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getSltSummary(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    let summary = await sltTrackingRepository.getSltSummaryByUserId(userId);

    if (!summary) {
      summary = await sltTrackingRepository.getOrCreateSltSummary(userId);
    }

    return summary;
  }

  /**
   * Update SLT summary
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async updateSltSummary(userId, updateData) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Ensure summary exists
    await this.getSltSummary(userId);

    return sltTrackingRepository.updateSltSummary(userId, updateData);
  }

  /**
   * Record course enrollment
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async recordCourseEnrollment(userId) {
    await this.getSltSummary(userId);
    return sltTrackingRepository.incrementCoursesEnrolled(userId);
  }

  /**
   * Record course completion
   */
  async recordCourseCompletion(userId) {
    await this.getSltSummary(userId);
    return sltTrackingRepository.incrementCompletedCourses(userId);
  }

  /**
   * Record certificate earned
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async recordCertificateEarned(userId) {
    await this.getSltSummary(userId);
    return sltTrackingRepository.incrementCertificatesEarned(userId);
  }

  /**
   * Update student score
   */
  async updateStudentScore(userId, newScore) {
    if (newScore < 0 || newScore > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    await this.getSltSummary(userId);
    return sltTrackingRepository.updateAverageScore(userId, newScore);
  }

  /**
   * Get leaderboard - top students by completion
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getLeaderboardByCompletion(limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    return sltTrackingRepository.getLeaderboardByCompletion(limit);
  }

  /**
   * Get leaderboard - top students by certificates
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getLeaderboardByCertificates(limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    return sltTrackingRepository.getLeaderboardByCertificates(limit);
  }

  /**
   * Get leaderboard - top students by hours
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getLeaderboardByHours(limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    return sltTrackingRepository.getLeaderboardByHours(limit);
  }

  /**
   * Get leaderboard - top students by score
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getLeaderboardByScore(limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    return sltTrackingRepository.getLeaderboardByScore(limit);
  }

  /**
   * Get student learning metrics
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async getStudentMetrics(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const summary = await this.getSltSummary(userId);
    const activityStats = await this.getActivityTrackingStats(userId);

    return {
      userId,
      coursesEnrolled: summary.totalCoursesEnrolled,
      coursesCompleted: summary.completedCourses,
      certificatesEarned: summary.certificatesEarned,
      totalHoursLearned: summary.totalHoursLearned,
      averageScore: summary.averageScore,
      lastActivityDate: summary.lastActivityDate,
      activityStats,
      completionRate: activityStats.completionRate,
      lastUpdated: summary.updatedAt,
    };
  }

  /**
   * Filter SLT summaries
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async filterSltSummaries(filters = {}, page = 1, limit = 10) {
    return sltTrackingRepository.filterSltSummaries(filters, page, limit);
  }

  /**
   * Get top students in a course
   */
  async getTopStudentsInCourse(filters = {}, limit = 10) {
    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    const result = await this.filterSltSummaries(filters, 1, limit);
    return result.data;
  }

  /**
   * Bulk create activity trackings
   */
  /**
   * Desc: Service function executes domain business logic and repository orchestration.
   * Params: Accept explicit method arguments passed from controller or internal callers.
   * Body: N/A at service layer; consume already validated payload objects.
   * Auth Headers: N/A at service layer; authorization is handled before service invocation.
   */
  async bulkTrackActivities(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('At least one activity entry is required');
    }

    return sltTrackingRepository.bulkCreateActivityTrackings(entries);
  }
}

module.exports = new SltTrackingService();

