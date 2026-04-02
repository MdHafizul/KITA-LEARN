/**
 * Domains Barrel Export
 * Clean imports for all domain modules (routes, repositories, services)
 * 
 * Usage:
 *   const { lecturerRoutes, assessmentsRoutes, coursesRoutes, activitiesRoutes, enrollmentRoutes, submissionsRoutes } = require('./domains');
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
// EXPORTS - Routes (for app.js mounting)
// ============================================
module.exports.routes = {
    lecturerRoutes,
    assessmentsRoutes,
    coursesRoutes,
    activitiesRoutes,
    enrollmentRoutes,
    submissionsRoutes
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
    submissionsRepository
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
    submissionsService
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

module.exports.lecturerService = lecturerService;
module.exports.assessmentsService = assessmentsService;
module.exports.coursesService = coursesService;
module.exports.activitiesService = activitiesService;
module.exports.enrollmentService = enrollmentService;
module.exports.submissionsService = submissionsService;
