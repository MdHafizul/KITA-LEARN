/**
 * Lecturer Domain Index
 * Exports from lecturer domain
 */

const lecturerController = require('./controllers/lecturer.controller');
const lecturerService = require('./services/lecturer.service');
const lecturerRepository = require('./repositories/lecturer.repository');
const lecturerRoutes = require('./routes/lecturer.routes');

module.exports = {
    lecturerController,
    lecturerService,
    lecturerRepository,
    lecturerRoutes
};
