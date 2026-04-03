/**
 * SLT Tracking Domain DTOs
 * Validation schemas for StudentActivityTracking and StudentSltSummary
 */

const { z } = require('zod');

/**
 * StudentActivityTracking DTOs
 */

const ActivityTrackingCreateDTO = z.object({
  userId: z.string().cuid('Invalid user ID'),
  activityId: z.string().cuid('Invalid activity ID'),
  viewCount: z.number().int().nonnegative().default(1),
  completionStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).default('NOT_STARTED'),
  timeSpentMinutes: z.number().int().nonnegative().default(0),
});

const ActivityTrackingUpdateDTO = z.object({
  viewCount: z.number().int().nonnegative().optional(),
  lastViewedAt: z.date().optional(),
  completionStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  timeSpentMinutes: z.number().int().nonnegative().optional(),
});

const ActivityTrackingResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  activityId: z.string(),
  viewCount: z.number(),
  lastViewedAt: z.date().nullable(),
  completionStatus: z.string(),
  timeSpentMinutes: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const ActivityTrackingWithRelationsDTO = ActivityTrackingResponseDTO.extend({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
  }).optional(),
  activity: z.object({
    id: z.string(),
    name: z.string(),
    courseId: z.string(),
  }).optional(),
});

const ActivityTrackingFilterDTO = z.object({
  userId: z.string().cuid().optional(),
  activityId: z.string().cuid().optional(),
  completionStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  minTimeSpent: z.number().int().nonnegative().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

const BulkActivityTrackingDTO = z.object({
  entries: z.array(ActivityTrackingCreateDTO).min(1),
});

const UpdateActivityProgressDTO = z.object({
  completionStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  timeSpentMinutes: z.number().int().nonnegative(),
});

/**
 * StudentSltSummary DTOs
 */

const StudentSltSummaryResponseDTO = z.object({
  id: z.string(),
  userId: z.string(),
  totalCoursesEnrolled: z.number().int().nonnegative(),
  completedCourses: z.number().int().nonnegative(),
  certificatesEarned: z.number().int().nonnegative(),
  totalHoursLearned: z.number().int().nonnegative(),
  averageScore: z.number().nullable(),
  lastActivityDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const StudentSltSummaryWithUserDTO = StudentSltSummaryResponseDTO.extend({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
  }).optional(),
});

const StudentSltSummaryFilterDTO = z.object({
  minCoursesCompleted: z.number().int().nonnegative().optional(),
  minCertificatesEarned: z.number().int().nonnegative().optional(),
  minHoursLearned: z.number().int().nonnegative().optional(),
  minAverageScore: z.number().min(0).max(100).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

const UpdateSltSummaryDTO = z.object({
  totalCoursesEnrolled: z.number().int().nonnegative().optional(),
  completedCourses: z.number().int().nonnegative().optional(),
  certificatesEarned: z.number().int().nonnegative().optional(),
  totalHoursLearned: z.number().int().nonnegative().optional(),
  averageScore: z.number().nullable().optional(),
  lastActivityDate: z.date().nullable().optional(),
});

/**
 * Analytics & Reporting DTOs
 */

const StudentLearningMetricsDTO = z.object({
  userId: z.string(),
  completionRate: z.number().min(0).max(100),
  averageTimePerActivity: z.number().nonnegative(),
  totalActivitiesCompleted: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
  lastActiveDate: z.date().nullable(),
});

const CourseProgressDTO = z.object({
  courseId: z.string(),
  courseName: z.string(),
  activitiesCompleted: z.number().int().nonnegative(),
  totalActivities: z.number().int().nonnegative(),
  completionPercentage: z.number().min(0).max(100),
  averageScore: z.number().nullable(),
});

const ActivityAnalyticsDTO = z.object({
  activityId: z.string(),
  activityName: z.string(),
  totalViews: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
  averageTimeSpent: z.number().nonnegative(),
  uniqueStudents: z.number().int().nonnegative(),
});

const ClassAnalyticsDTO = z.object({
  classId: z.string(),
  className: z.string(),
  totalEnrolled: z.number().int().nonnegative(),
  activeStudents: z.number().int().nonnegative(),
  averageCompletionRate: z.number().min(0).max(100),
  averageScore: z.number().nullable(),
});

module.exports = {
  // Activity Tracking
  ActivityTrackingCreateDTO,
  ActivityTrackingUpdateDTO,
  ActivityTrackingResponseDTO,
  ActivityTrackingWithRelationsDTO,
  ActivityTrackingFilterDTO,
  BulkActivityTrackingDTO,
  UpdateActivityProgressDTO,

  // SLT Summary
  StudentSltSummaryResponseDTO,
  StudentSltSummaryWithUserDTO,
  StudentSltSummaryFilterDTO,
  UpdateSltSummaryDTO,

  // Analytics
  StudentLearningMetricsDTO,
  CourseProgressDTO,
  ActivityAnalyticsDTO,
  ClassAnalyticsDTO,
};
