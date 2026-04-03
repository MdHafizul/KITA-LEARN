/**
 * Announcements Domain - Barrel Export
 * Aggregates all announcements module exports
 */

const announcementsRoutes = require('./routes/announcements.routes');
const announcementsRepository = require('./repositories/announcements.repository');
const announcementsService = require('./services/announcements.service');
const announcementsController = require('./controllers/announcements.controller');
const {
    AnnouncementCreateDTO,
    AnnouncementUpdateDTO,
    AnnouncementResponseDTO,
    AnnouncementWithRelationsDTO,
    AnnouncementFilterDTO,
    AnnouncementReadDTO,
    BulkAnnouncementCreateDTO,
    AnnouncementRecipientDTO
} = require('./dtos/announcements.dtos');

module.exports = {
    routes: announcementsRoutes,
    service: announcementsService,
    repository: announcementsRepository,
    controller: announcementsController,
    dtos: {
        AnnouncementCreateDTO,
        AnnouncementUpdateDTO,
        AnnouncementResponseDTO,
        AnnouncementWithRelationsDTO,
        AnnouncementFilterDTO,
        AnnouncementReadDTO,
        BulkAnnouncementCreateDTO,
        AnnouncementRecipientDTO
    }
};
