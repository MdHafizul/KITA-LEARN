/**
 * Domains Barrel Export
 * Clean imports for all domain modules (routes, repositories, services)
 * 
 * Usage:
 *   const { lecturerRoutes, assessmentsRoutes, coursesRoutes, activitiesRoutes, enrollmentRoutes, submissionsRoutes, gradesRoutes, announcementsRoutes } = require('./domains');
 */

// ============================================
// LECTURER DOMAIN
// ============================================
const lecturerRoutes = require('./lecturer/routes/lecturer.routes');
const lecturerRepository = require('./lecturer/repositories/lecturer.repository');
const lecturerService = require('./lecturer/services/lecturer.service');
const {
    LecturerCreateDTO,
    LecturerUpdateDTO,
    LecturerResponseDTO
} = require('./lecturer/dtos/lecturer.dtos');

// ============================================
// ASSESSMENTS DOMAIN
// ============================================
const assessmentsRoutes = require('./assessments/routes/assessments.routes');
const assessmentsRepository = require('./assessments/repositories/assessments.repository');
const assessmentsService = require('./assessments/services/assessments.service');
const {
    ExamCreateDTO,
    ExamUpdateDTO,
    ExamQuestionCreateDTO,
    ExamQuestionUpdateDTO,
    ExamAttemptStartDTO,
    ExamAttemptSubmitDTO,
    GradingSchemeCreateDTO,
    GradingSchemeUpdateDTO
} = require('./assessments/dtos/assessments.dtos');

// ============================================
// COURSES DOMAIN
// ============================================
const coursesRoutes = require('./courses/routes/courses.routes');
const coursesRepository = require('./courses/repositories/courses.repository');
const coursesService = require('./courses/services/courses.service');
const {
    CourseCreateDTO,
    CourseUpdateDTO,
    CoursePrerequisiteCreateDTO,
    CourseMaterialCreateDTO,
    CourseMaterialUpdateDTO
} = require('./courses/dtos/courses.dtos');

// ============================================
// ACTIVITIES DOMAIN
// ============================================
const activitiesRoutes = require('./activities/routes/activities.routes');
const activitiesRepository = require('./activities/repositories/activities.repository');
const activitiesService = require('./activities/services/activities.service');
const {
    LearningActivityCreateDTO,
    LearningActivityUpdateDTO,
    ActivityPrerequisiteCreateDTO,
    ContentActivityCreateDTO,
    ContentActivityUpdateDTO,
    AssignmentCreateDTO,
    AssignmentUpdateDTO
} = require('./activities/dtos/activities.dtos');

// ============================================
// ENROLLMENT DOMAIN
// ============================================
const enrollmentRoutes = require('./enrollment/routes/enrollment.routes');
const enrollmentRepository = require('./enrollment/repositories/enrollment.repository');
const enrollmentService = require('./enrollment/services/enrollment.service');
const {
    EnrollmentCreateDTO,
    EnrollmentUpdateDTO,
    EnrollmentResponseDTO,
    EnrollmentWithRelationsDTO,
    BulkEnrollmentDTO,
    EnrollmentFilterDTO
} = require('./enrollment/dtos/enrollment.dtos');

// ============================================
// SUBMISSIONS DOMAIN
// ============================================
const submissionsRoutes = require('./submissions/routes/submissions.routes');
const submissionsRepository = require('./submissions/repositories/submissions.repository');
const submissionsService = require('./submissions/services/submissions.service');
const {
    SubmissionCreateDTO,
    SubmissionUpdateDTO,
    SubmissionResponseDTO,
    SubmissionWithRelationsDTO,
    SubmissionGradeDTO,
    BatchGradeDTO,
    SubmissionFilterDTO
} = require('./submissions/dtos/submissions.dtos');

// ============================================
// GRADES DOMAIN
// ============================================
const gradesRoutes = require('./grades/routes/grades.routes');
const gradesRepository = require('./grades/repositories/grades.repository');
const gradesService = require('./grades/services/grades.service');
const {
    GradeCreateDTO,
    GradeUpdateDTO,
    GradeResponseDTO,
    GradeWithRelationsDTO,
    BulkGradeDTO,
    GradeFilterDTO,
    RubricCreateDTO,
    RubricUpdateDTO,
    RubricResponseDTO
} = require('./grades/dtos/grades.dtos');

// ============================================
// ANNOUNCEMENTS DOMAIN
// ============================================
const announcementsRoutes = require('./announcements/routes/announcements.routes');
const announcementsRepository = require('./announcements/repositories/announcements.repository');
const announcementsService = require('./announcements/services/announcements.service');
const {
    AnnouncementCreateDTO,
    AnnouncementUpdateDTO,
    AnnouncementResponseDTO,
    AnnouncementWithRelationsDTO,
    AnnouncementFilterDTO,
    AnnouncementReadDTO,
    BulkAnnouncementCreateDTO,
    AnnouncementRecipientDTO
} = require('./announcements/dtos/announcements.dtos');

// ============================================
// CLASSES DOMAIN
// ============================================
const classesRoutes = require('./classes/routes/classes.routes');
const classesRepository = require('./classes/repositories/classes.repository');
const classesService = require('./classes/services/classes.service');
const {
    ClassCreateDTO,
    ClassUpdateDTO,
    ClassResponseDTO,
    ClassWithRelationsDTO,
    ClassFilterDTO,
    BulkClassCreateDTO,
    ClassEnrollmentCreateDTO,
    ClassEnrollmentResponseDTO,
    ClassEnrollmentUpdateDTO,
    BulkClassEnrollmentDTO,
    ClassSessionCreateDTO,
    ClassSessionUpdateDTO,
    ClassSessionResponseDTO,
    ClassSessionFilterDTO
} = require('./classes/dtos/classes.dtos');

// ============================================
// IDENTITY DOMAIN
// ============================================
const identityRoutes = require('./identity/routes/identity.routes');
const identityRepository = require('./identity/repositories/identity.repository');
const identityService = require('./identity/services/identity.service');
const {
    UserRegisterDTO,
    UserLoginDTO,
    UserUpdateDTO,
    UserResponseDTO,
    UserWithRolesDTO,
    UserFilterDTO,
    ChangePasswordDTO,
    RoleCreateDTO,
    RoleUpdateDTO,
    RoleResponseDTO,
    RoleWithPermissionsDTO,
    PermissionCreateDTO,
    PermissionUpdateDTO,
    PermissionResponseDTO,
    AssignPermissionToRoleDTO,
    RolePermissionResponseDTO,
    AssignRoleToUserDTO,
    BulkAssignRolesToUserDTO,
    UserRoleResponseDTO
} = require('./identity/dtos/identity.dtos');

// ============================================
// SLT TRACKING DOMAIN
// ============================================
const sltTrackingRoutes = require('./slt-tracking/routes/slt-tracking.routes');
const sltTrackingRepository = require('./slt-tracking/repositories/slt-tracking.repository');
const sltTrackingService = require('./slt-tracking/services/slt-tracking.service');
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
    ClassAnalyticsDTO
} = require('./slt-tracking/dtos/slt-tracking.dtos');

// ============================================
// PROGRESSION & CERTIFICATES DOMAIN
// ============================================
const progressionCertificatesRoutes = require('./progression-certificates/routes/progression-certificates.routes');
const progressionCertificatesRepository = require('./progression-certificates/repositories/progression-certificates.repository');
const progressionCertificatesService = require('./progression-certificates/services/progression-certificates.service');
const {
    StudentProgressionCreateDTO,
    StudentProgressionUpdateDTO,
    StudentProgressionResponseDTO,
    StudentProgressionWithUserDTO,
    StudentProgressionFilterDTO,
    AwardPointsDTO,
    LevelUpDTO,
    CertificateCreateDTO,
    CertificateUpdateDTO,
    CertificateResponseDTO,
    CertificateWithUserDTO,
    CertificateFilterDTO,
    VerifyCertificateDTO,
    CertificateValidationDTO,
    BulkCertificateCreateDTO,
    BulkCertificateVerifyDTO,
    StudentAchievementDTO,
    ProgressionMilestoneDTO,
    UserAchievementSummaryDTO
} = require('./progression-certificates/dtos/progression-certificates.dtos');

// ============================================
// EXPORTS - Routes (for app.js mounting)
// ============================================
module.exports.routes = {
    lecturerRoutes,
    assessmentsRoutes,
    coursesRoutes,
    activitiesRoutes,
    enrollmentRoutes,
    submissionsRoutes,
    gradesRoutes,
    announcementsRoutes,
    classesRoutes,
    identityRoutes,
    sltTrackingRoutes,
    progressionCertificatesRoutes
};

// ============================================
// EXPORTS - Repositories (for service direct access)
// ============================================
module.exports.repositories = {
    lecturerRepository,
    assessmentsRepository,
    coursesRepository,
    activitiesRepository,
    enrollmentRepository,
    submissionsRepository,
    gradesRepository,
    announcementsRepository,
    classesRepository,
    identityRepository,
    sltTrackingRepository,
    progressionCertificatesRepository
};

// ============================================
// EXPORTS - Services
// ============================================
module.exports.services = {
    lecturerService,
    assessmentsService,
    coursesService,
    activitiesService,
    enrollmentService,
    submissionsService,
    gradesService,
    announcementsService,
    classesService,
    identityService,
    sltTrackingService,
    progressionCertificatesService
};

// ============================================
// EXPORTS - DTOs (for external validation)
// ============================================
module.exports.dtos = {
    lecturer: {
        LecturerCreateDTO,
        LecturerUpdateDTO,
        LecturerResponseDTO
    },
    assessments: {
        ExamCreateDTO,
        ExamUpdateDTO,
        ExamQuestionCreateDTO,
        ExamQuestionUpdateDTO,
        ExamAttemptStartDTO,
        ExamAttemptSubmitDTO,
        GradingSchemeCreateDTO,
        GradingSchemeUpdateDTO
    },
    courses: {
        CourseCreateDTO,
        CourseUpdateDTO,
        CoursePrerequisiteCreateDTO,
        CourseMaterialCreateDTO,
        CourseMaterialUpdateDTO
    },
    activities: {
        LearningActivityCreateDTO,
        LearningActivityUpdateDTO,
        ActivityPrerequisiteCreateDTO,
        ContentActivityCreateDTO,
        ContentActivityUpdateDTO,
        AssignmentCreateDTO,
        AssignmentUpdateDTO
    },
    enrollment: {
        EnrollmentCreateDTO,
        EnrollmentUpdateDTO,
        EnrollmentResponseDTO,
        EnrollmentWithRelationsDTO,
        BulkEnrollmentDTO,
        EnrollmentFilterDTO
    },
    submissions: {
        SubmissionCreateDTO,
        SubmissionUpdateDTO,
        SubmissionResponseDTO,
        SubmissionWithRelationsDTO,
        SubmissionGradeDTO,
        BatchGradeDTO,
        SubmissionFilterDTO
    },
    grades: {
        GradeCreateDTO,
        GradeUpdateDTO,
        GradeResponseDTO,
        GradeWithRelationsDTO,
        BulkGradeDTO,
        GradeFilterDTO,
        RubricCreateDTO,
        RubricUpdateDTO,
        RubricResponseDTO
    },
    announcements: {
        AnnouncementCreateDTO,
        AnnouncementUpdateDTO,
        AnnouncementResponseDTO,
        AnnouncementWithRelationsDTO,
        AnnouncementFilterDTO,
        AnnouncementReadDTO,
        BulkAnnouncementCreateDTO,
        AnnouncementRecipientDTO
    },
    classes: {
        ClassCreateDTO,
        ClassUpdateDTO,
        ClassResponseDTO,
        ClassWithRelationsDTO,
        ClassFilterDTO,
        BulkClassCreateDTO,
        ClassEnrollmentCreateDTO,
        ClassEnrollmentResponseDTO,
        ClassEnrollmentUpdateDTO,
        BulkClassEnrollmentDTO,
        ClassSessionCreateDTO,
        ClassSessionUpdateDTO,
        ClassSessionResponseDTO,
        ClassSessionFilterDTO
    },
    identity: {
        UserRegisterDTO,
        UserLoginDTO,
        UserUpdateDTO,
        UserResponseDTO,
        UserWithRolesDTO,
        UserFilterDTO,
        ChangePasswordDTO,
        RoleCreateDTO,
        RoleUpdateDTO,
        RoleResponseDTO,
        RoleWithPermissionsDTO,
        PermissionCreateDTO,
        PermissionUpdateDTO,
        PermissionResponseDTO,
        AssignPermissionToRoleDTO,
        RolePermissionResponseDTO,
        AssignRoleToUserDTO,
        BulkAssignRolesToUserDTO,
        UserRoleResponseDTO
    },
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
        ClassAnalyticsDTO
    },
    progressionCertificates: {
        StudentProgressionCreateDTO,
        StudentProgressionUpdateDTO,
        StudentProgressionResponseDTO,
        StudentProgressionWithUserDTO,
        StudentProgressionFilterDTO,
        AwardPointsDTO,
        LevelUpDTO,
        CertificateCreateDTO,
        CertificateUpdateDTO,
        CertificateResponseDTO,
        CertificateWithUserDTO,
        CertificateFilterDTO,
        VerifyCertificateDTO,
        CertificateValidationDTO,
        BulkCertificateCreateDTO,
        BulkCertificateVerifyDTO,
        StudentAchievementDTO,
        ProgressionMilestoneDTO,
        UserAchievementSummaryDTO
    }
};

// ============================================
// EXPORTS - Flat (for direct imports)
// ============================================
module.exports.lecturerRoutes = lecturerRoutes;
module.exports.assessmentsRoutes = assessmentsRoutes;
module.exports.coursesRoutes = coursesRoutes;
module.exports.activitiesRoutes = activitiesRoutes;
module.exports.enrollmentRoutes = enrollmentRoutes;
module.exports.submissionsRoutes = submissionsRoutes;
module.exports.gradesRoutes = gradesRoutes;
module.exports.announcementsRoutes = announcementsRoutes;
module.exports.classesRoutes = classesRoutes;
module.exports.identityRoutes = identityRoutes;
module.exports.sltTrackingRoutes = sltTrackingRoutes;
module.exports.progressionCertificatesRoutes = progressionCertificatesRoutes;

module.exports.lecturerService = lecturerService;
module.exports.assessmentsService = assessmentsService;
module.exports.coursesService = coursesService;
module.exports.activitiesService = activitiesService;
module.exports.enrollmentService = enrollmentService;
module.exports.submissionsService = submissionsService;
module.exports.gradesService = gradesService;
module.exports.announcementsService = announcementsService;
module.exports.classesService = classesService;
module.exports.identityService = identityService;
module.exports.sltTrackingService = sltTrackingService;
module.exports.progressionCertificatesService = progressionCertificatesService;
