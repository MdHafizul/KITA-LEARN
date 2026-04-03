/**
 * Classes Domain Barrel Export
 * Aggregates all routes, services, repositories, and DTOs
 * Single import point: const { classesRoutes, classesService } = require('./classes')
 */

const classesRoutes = require('./routes/classes.routes');
const classesService = require('./services/classes.service');
const classesRepository = require('./repositories/classes.repository');
const classesController = require('./controllers/classes.controller');

const dtos = require('./dtos/classes.dtos');

module.exports = {
  // Routes
  classesRoutes,

  // Service & Repository
  classesService,
  classesRepository,
  classesController,

  // All DTOs
  dtos,
  ClassCreateDTO: dtos.ClassCreateDTO,
  ClassUpdateDTO: dtos.ClassUpdateDTO,
  ClassResponseDTO: dtos.ClassResponseDTO,
  ClassWithRelationsDTO: dtos.ClassWithRelationsDTO,
  ClassFilterDTO: dtos.ClassFilterDTO,
  BulkClassCreateDTO: dtos.BulkClassCreateDTO,
  ClassEnrollmentCreateDTO: dtos.ClassEnrollmentCreateDTO,
  ClassEnrollmentResponseDTO: dtos.ClassEnrollmentResponseDTO,
  ClassEnrollmentUpdateDTO: dtos.ClassEnrollmentUpdateDTO,
  BulkClassEnrollmentDTO: dtos.BulkClassEnrollmentDTO,
  ClassSessionCreateDTO: dtos.ClassSessionCreateDTO,
  ClassSessionUpdateDTO: dtos.ClassSessionUpdateDTO,
  ClassSessionResponseDTO: dtos.ClassSessionResponseDTO,
  ClassSessionFilterDTO: dtos.ClassSessionFilterDTO,
};
