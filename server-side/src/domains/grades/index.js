/**
 * Grades Domain - Barrel Export
 * Aggregates all grades module exports
 */

const gradesRoutes = require('./routes/grades.routes');
const gradesRepository = require('./repositories/grades.repository');
const gradesService = require('./services/grades.service');
const gradesController = require('./controllers/grades.controller');
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
} = require('./dtos/grades.dtos');

module.exports = {
    routes: gradesRoutes,
    service: gradesService,
    repository: gradesRepository,
    controller: gradesController,
    dtos: {
        GradeCreateDTO,
        GradeUpdateDTO,
        GradeResponseDTO,
        GradeWithRelationsDTO,
        BulkGradeDTO,
        GradeFilterDTO,
        RubricCreateDTO,
        RubricUpdateDTO,
        RubricResponseDTO
    }
};
