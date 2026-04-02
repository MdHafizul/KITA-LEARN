/**
 * Courses Domain Index
 * Barrel export for courses domain
 */

const coursesController = require('./controllers/courses.controller');
const coursesService = require('./services/courses.service');
const coursesRepository = require('./repositories/courses.repository');
const coursesRoutes = require('./routes/courses.routes');

module.exports = {
    coursesController,
    coursesService,
    coursesRepository,
    coursesRoutes
};
