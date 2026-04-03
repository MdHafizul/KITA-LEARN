/**
 * Routes Aggregator
 * Central export point for all domain routes
 * 
 * Usage in app.js:
 *   const { lecturerRoutes, coursesRoutes, ... } = require('./routes');
 */

const express = require('express');
const { routes } = require('../domains');

// Create placeholder for audit routes if not yet implemented
const auditRoutes = express.Router();
auditRoutes.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Audit routes coming soon',
        timestamp: new Date().toISOString()
    });
});

module.exports = {
    authRoutes: routes.identityRoutes,
    courseRoutes: routes.coursesRoutes,
    activityRoutes: routes.activitiesRoutes,
    examRoutes: routes.assessmentsRoutes,
    submissionRoutes: routes.submissionsRoutes,
    gradingRoutes: routes.gradesRoutes,
    certificateRoutes: routes.progressionCertificatesRoutes,
    enrollmentRoutes: routes.enrollmentRoutes,
    announcementRoutes: routes.announcementsRoutes,
    classRoutes: routes.classesRoutes,
    lecturerRoutes: routes.lecturerRoutes,
    sltTrackingRoutes: routes.sltTrackingRoutes,
    progressionCertificatesRoutes: routes.progressionCertificatesRoutes,
    auditRoutes: auditRoutes
};
