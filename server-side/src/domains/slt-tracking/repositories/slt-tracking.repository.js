/**
 * SLT Tracking Repository
 * Prisma queries for StudentActivityTracking and StudentSltSummary
 */

const prisma = require('../../../config/database');

class SltTrackingRepository {
  // ============================================
  // ACTIVITY TRACKING OPERATIONS
  // ============================================

  /**
   * Create activity tracking record
   */
  async createActivityTracking(data) {
    try {
      return await prisma.studentActivityTracking.create({
        data,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          activity: { select: { id: true, name: true } },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(`Activity already being tracked for this user`);
      }
      throw error;
    }
  }

  /**
   * Get activity tracking by ID
   */
  async getActivityTrackingById(trackingId, includeRelations = true) {
    return prisma.studentActivityTracking.findUnique({
      where: { id: trackingId },
      include: includeRelations ? {
        user: { select: { id: true, email: true, fullName: true } },
        activity: { select: { id: true, name: true } },
      } : false,
    });
  }

  /**
   * Get activity tracking by userId and activityId
   */
  async getActivityTrackingByUserActivity(userId, activityId) {
    return prisma.studentActivityTracking.findUnique({
      where: { userId_activityId: { userId, activityId } },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        activity: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Update activity tracking
   */
  async updateActivityTracking(trackingId, data) {
    return prisma.studentActivityTracking.update({
      where: { id: trackingId },
      data: {
        ...data,
        lastViewedAt: data.lastViewedAt || new Date(),
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        activity: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(trackingId) {
    return prisma.studentActivityTracking.update({
      where: { id: trackingId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });
  }

  /**
   * Update time spent
   */
  async updateTimeSpent(trackingId, additionalMinutes) {
    return prisma.studentActivityTracking.update({
      where: { id: trackingId },
      data: {
        timeSpentMinutes: { increment: additionalMinutes },
        lastViewedAt: new Date(),
      },
    });
  }

  /**
   * Get user activity trackings
   */
  async getUserActivityTrackings(userId, filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      deletedAt: null,
      ...(filters.completionStatus && { completionStatus: filters.completionStatus }),
      ...(filters.minTimeSpent && { timeSpentMinutes: { gte: filters.minTimeSpent } }),
      ...(filters.activityId && { activityId: filters.activityId }),
      ...(filters.startDate && { createdAt: { gte: filters.startDate } }),
      ...(filters.endDate && { createdAt: { lte: filters.endDate } }),
    };

    const [data, total] = await Promise.all([
      prisma.studentActivityTracking.findMany({
        where,
        include: { activity: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.studentActivityTracking.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Get activities by completion status
   */
  async getActivitiesByStatus(userId, status) {
    return prisma.studentActivityTracking.findMany({
      where: { userId, completionStatus: status, deletedAt: null },
      include: { activity: { select: { id: true, name: true, courseId: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get completed activities for user
   */
  async getCompletedActivities(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.studentActivityTracking.findMany({
        where: { userId, completionStatus: 'COMPLETED', deletedAt: null },
        include: { activity: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.studentActivityTracking.count({
        where: { userId, completionStatus: 'COMPLETED', deletedAt: null },
      }),
    ]);

    return { data, total, pages: Math.ceil(total / limit) };
  }

  /**
   * Delete activity tracking
   */
  async deleteActivityTracking(trackingId) {
    return prisma.studentActivityTracking.delete({
      where: { id: trackingId },
    });
  }

  /**
   * Bulk create activity trackings
   */
  async bulkCreateActivityTrackings(entries) {
    return prisma.studentActivityTracking.createMany({
      data: entries,
      skipDuplicates: true,
    });
  }

  // ============================================
  // SLT SUMMARY OPERATIONS
  // ============================================

  /**
   * Get or create SLT summary for user
   */
  async getOrCreateSltSummary(userId) {
    return prisma.studentSltSummary.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        totalHoursLearned: 0,
      },
    });
  }

  /**
   * Get SLT summary by ID
   */
  async getSltSummaryById(summaryId) {
    return prisma.studentSltSummary.findUnique({
      where: { id: summaryId },
    });
  }

  /**
   * Get SLT summary by userId
   */
  async getSltSummaryByUserId(userId) {
    return prisma.studentSltSummary.findUnique({
      where: { userId },
    });
  }

  /**
   * Update SLT summary
   */
  async updateSltSummary(userId, data) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data,
    });
  }

  /**
   * Increment courses enrolled
   */
  async incrementCoursesEnrolled(userId) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { totalCoursesEnrolled: { increment: 1 } },
    });
  }

  /**
   * Increment completed courses
   */
  async incrementCompletedCourses(userId) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { completedCourses: { increment: 1 } },
    });
  }

  /**
   * Increment certificates earned
   */
  async incrementCertificatesEarned(userId) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { certificatesEarned: { increment: 1 } },
    });
  }

  /**
   * Add hours learned
   */
  async addHoursLearned(userId, hours) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { totalHoursLearned: { increment: hours } },
    });
  }

  /**
   * Update average score
   */
  async updateAverageScore(userId, newScore) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { averageScore: newScore },
    });
  }

  /**
   * Update last activity date
   */
  async updateLastActivityDate(userId, activityDate = new Date()) {
    return prisma.studentSltSummary.update({
      where: { userId },
      data: { lastActivityDate: activityDate },
    });
  }

  /**
   * Get leaderboard by completion
   */
  async getLeaderboardByCompletion(limit = 10) {
    return prisma.studentSltSummary.findMany({
      where: { deletedAt: null },
      orderBy: { completedCourses: 'desc' },
      take: limit,
    });
  }

  /**
   * Get leaderboard by certificates
   */
  async getLeaderboardByCertificates(limit = 10) {
    return prisma.studentSltSummary.findMany({
      where: { deletedAt: null },
      orderBy: { certificatesEarned: 'desc' },
      take: limit,
    });
  }

  /**
   * Get leaderboard by hours
   */
  async getLeaderboardByHours(limit = 10) {
    return prisma.studentSltSummary.findMany({
      where: { deletedAt: null },
      orderBy: { totalHoursLearned: 'desc' },
      take: limit,
    });
  }

  /**
   * Get leaderboard by average score
   */
  async getLeaderboardByScore(limit = 10) {
    return prisma.studentSltSummary.findMany({
      where: { deletedAt: null, averageScore: { not: null } },
      orderBy: { averageScore: 'desc' },
      take: limit,
    });
  }

  /**
   * Filter SLT summaries
   */
  async filterSltSummaries(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(filters.minCoursesCompleted && { completedCourses: { gte: filters.minCoursesCompleted } }),
      ...(filters.minCertificatesEarned && { certificatesEarned: { gte: filters.minCertificatesEarned } }),
      ...(filters.minHoursLearned && { totalHoursLearned: { gte: filters.minHoursLearned } }),
      ...(filters.minAverageScore && { averageScore: { gte: filters.minAverageScore } }),
    };

    const [data, total] = await Promise.all([
      prisma.studentSltSummary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.studentSltSummary.count({ where }),
    ]);

    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Get multiple users SLT summaries
   */
  async getUsersSltSummaries(userIds) {
    return prisma.studentSltSummary.findMany({
      where: { userId: { in: userIds } },
    });
  }
}

module.exports = new SltTrackingRepository();
