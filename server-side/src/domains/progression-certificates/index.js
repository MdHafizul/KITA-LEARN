/**
 * Progression & Certificates Domain Index
 * Barrel export aggregating all layers
 */

const progressionCertificatesRoutes = require('./routes/progression-certificates.routes');
const progressionCertificatesService = require('./services/progression-certificates.service');
const progressionCertificatesRepository = require('./repositories/progression-certificates.repository');
const {
  StudentProgressionCreateDTO,
  StudentProgressionUpdateDTO,
  StudentProgressionResponseDTO,
  StudentProgressionWithUserDTO,
  StudentProgressionFilterDTO,
  AwardPointsDTO,
  LevelUpDTO,
  CertificateCreateDTO,
  CertificateUpdateDTO,
  CertificateResponseDTO,
  CertificateWithUserDTO,
  CertificateFilterDTO,
  VerifyCertificateDTO,
  CertificateValidationDTO,
  BulkCertificateCreateDTO,
  BulkCertificateVerifyDTO,
  StudentAchievementDTO,
  ProgressionMilestoneDTO,
  UserAchievementSummaryDTO,
} = require('./dtos/progression-certificates.dtos');

module.exports = {
  // Routes
  progressionCertificatesRoutes,

  // Service
  progressionCertificatesService,

  // Repository
  progressionCertificatesRepository,

  // DTOs
  progressionCertificates: {
    StudentProgressionCreateDTO,
    StudentProgressionUpdateDTO,
    StudentProgressionResponseDTO,
    StudentProgressionWithUserDTO,
    StudentProgressionFilterDTO,
    AwardPointsDTO,
    LevelUpDTO,
    CertificateCreateDTO,
    CertificateUpdateDTO,
    CertificateResponseDTO,
    CertificateWithUserDTO,
    CertificateFilterDTO,
    VerifyCertificateDTO,
    CertificateValidationDTO,
    BulkCertificateCreateDTO,
    BulkCertificateVerifyDTO,
    StudentAchievementDTO,
    ProgressionMilestoneDTO,
    UserAchievementSummaryDTO,
  },
};
