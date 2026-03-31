const express = require('express');
const { certificateController } = require('../controllers');
const { validateParams } = require('../middleware/validation.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { z } = require('zod');

const certificateRoutes = express.Router();

const CertificateIdDTO = z.object({ certificateId: z.string().uuid() });
const StudentIdDTO = z.object({ studentId: z.string().uuid() });

/**
 * POST /api/v1/certificates/generate
 * Generate certificate for student course completion
 */
certificateRoutes.post(
  '/generate',
  authMiddleware,
  certificateController.generateCertificate
);

/**
 * GET /api/v1/certificates/:certificateId
 * Get certificate details
 */
certificateRoutes.get(
  '/:certificateId',
  validateParams(CertificateIdDTO),
  certificateController.getCertificate
);

/**
 * GET /api/v1/certificates/student/:studentId
 * Get all certificates for student
 */
certificateRoutes.get(
  '/student/:studentId',
  authMiddleware,
  validateParams(StudentIdDTO),
  certificateController.getStudentCertificates
);

/**
 * POST /api/v1/certificates/:certificateId/verify
 * Verify certificate authenticity
 */
certificateRoutes.post(
  '/:certificateId/verify',
  validateParams(CertificateIdDTO),
  certificateController.verifyCertificate
);

/**
 * POST /api/v1/certificates/:certificateId/revoke
 * Revoke certificate
 */
certificateRoutes.post(
  '/:certificateId/revoke',
  authMiddleware,
  validateParams(CertificateIdDTO),
  certificateController.revokeCertificate
);

/**
 * GET /api/v1/certificates/:certificateId/download
 * Download certificate PDF
 */
certificateRoutes.get(
  '/:certificateId/download',
  validateParams(CertificateIdDTO),
  certificateController.downloadCertificatePDF
);

module.exports = certificateRoutes;
