/**
 * Enrollment Domain - Barrel Export
 * Aggregates all enrollment module exports
 */

const enrollmentRoutes = require('./routes/enrollment.routes');
const enrollmentRepository = require('./repositories/enrollment.repository');
const enrollmentService = require('./services/enrollment.service');
const enrollmentController = require('./controllers/enrollment.controller');
const {
    EnrollmentCreateDTO,
    EnrollmentUpdateDTO,
    EnrollmentResponseDTO,
    EnrollmentWithRelationsDTO,
    BulkEnrollmentDTO,
    EnrollmentFilterDTO
} = require('./dtos/enrollment.dtos');

module.exports = {
    routes: enrollmentRoutes,
    service: enrollmentService,
    repository: enrollmentRepository,
    controller: enrollmentController,
    dtos: {
        EnrollmentCreateDTO,
        EnrollmentUpdateDTO,
        EnrollmentResponseDTO,
        EnrollmentWithRelationsDTO,
        BulkEnrollmentDTO,
        EnrollmentFilterDTO
    }
};
