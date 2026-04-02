/**
 * Submissions Domain - Barrel Export
 * Aggregates all submissions module exports
 */

const submissionsRoutes = require('./routes/submissions.routes');
const submissionsRepository = require('./repositories/submissions.repository');
const submissionsService = require('./services/submissions.service');
const submissionsController = require('./controllers/submissions.controller');
const {
    SubmissionCreateDTO,
    SubmissionUpdateDTO,
    SubmissionResponseDTO,
    SubmissionWithRelationsDTO,
    SubmissionGradeDTO,
    BatchGradeDTO,
    SubmissionFilterDTO
} = require('./dtos/submissions.dtos');

module.exports = {
    routes: submissionsRoutes,
    service: submissionsService,
    repository: submissionsRepository,
    controller: submissionsController,
    dtos: {
        SubmissionCreateDTO,
        SubmissionUpdateDTO,
        SubmissionResponseDTO,
        SubmissionWithRelationsDTO,
        SubmissionGradeDTO,
        BatchGradeDTO,
        SubmissionFilterDTO
    }
};
