/**
 * SLT Tracking Domain Barrel Export
 * Aggregates all SLT Tracking domain layers: routes, services, repositories, DTOs
 */

const sltTrackingRoutes = require('./routes/slt-tracking.routes');
const sltTrackingService = require('./services/slt-tracking.service');
const sltTrackingRepository = require('./repositories/slt-tracking.repository');
const {
  ActivityTrackingCreateDTO,
  ActivityTrackingUpdateDTO,
  ActivityTrackingResponseDTO,
  ActivityTrackingWithRelationsDTO,
  ActivityTrackingFilterDTO,
  BulkActivityTrackingDTO,
  UpdateActivityProgressDTO,
  StudentSltSummaryResponseDTO,
  StudentSltSummaryWithUserDTO,
  StudentSltSummaryFilterDTO,
  UpdateSltSummaryDTO,
  StudentLearningMetricsDTO,
  CourseProgressDTO,
  ActivityAnalyticsDTO,
  ClassAnalyticsDTO,
} = require('./dtos/slt-tracking.dtos');

module.exports = {
  // Routes
  sltTrackingRoutes,

  // Service
  sltTrackingService,

  // Repository
  sltTrackingRepository,

  // DTOs
  sltTracking: {
    ActivityTrackingCreateDTO,
    ActivityTrackingUpdateDTO,
    ActivityTrackingResponseDTO,
    ActivityTrackingWithRelationsDTO,
    ActivityTrackingFilterDTO,
    BulkActivityTrackingDTO,
    UpdateActivityProgressDTO,
    StudentSltSummaryResponseDTO,
    StudentSltSummaryWithUserDTO,
    StudentSltSummaryFilterDTO,
    UpdateSltSummaryDTO,
    StudentLearningMetricsDTO,
    CourseProgressDTO,
    ActivityAnalyticsDTO,
    ClassAnalyticsDTO,
  },
};
