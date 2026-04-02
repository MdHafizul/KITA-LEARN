/**
 * Activities Domain Index
 * Barrel export for activities domain
 */

const activitiesController = require('./controllers/activities.controller');
const activitiesService = require('./services/activities.service');
const activitiesRepository = require('./repositories/activities.repository');
const activitiesRoutes = require('./routes/activities.routes');

module.exports = {
    activitiesController,
    activitiesService,
    activitiesRepository,
    activitiesRoutes
};
