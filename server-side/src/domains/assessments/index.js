/**
 * Assessments Domain Index
 * Barrel export for assessments domain
 */

const assessmentsController = require('./controllers/assessments.controller');
const assessmentsService = require('./services/assessments.service');
const assessmentsRepository = require('./repositories/assessments.repository');
const assessmentsRoutes = require('./routes/assessments.routes');

module.exports = {
    assessmentsController,
    assessmentsService,
    assessmentsRepository,
    assessmentsRoutes
};
