/**
 * CertificateController - Handles certificate generation and verification
 */

const { statusCodes } = require('../config/constants');
const { CertificateService } = require('../services');

class CertificateController {
  /**
   * Get certificates for authenticated user
   * GET /api/v1/certificates
   */
  static async getUserCertificates(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await CertificateService.getUserCertificates(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          certificates: result.certificates,
          pagination: { page: result.page, limit: result.limit, total: result.total },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single certificate by ID
   * GET /api/v1/certificates/:certificateId
   */
  static async getCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;

      const certificate = await CertificateService.getCertificateById(certificateId);

      if (!certificate) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Certificate not found',
          code: 'CERTIFICATE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { certificate },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify certificate authenticity
   * GET /api/v1/certificates/:certificateId/verify
   */
  static async verifyCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;

      const isValid = await CertificateService.verifyCertificate(certificateId);

      res.status(statusCodes.OK).json({
        success: true,
        data: {
          valid: isValid,
          certificateId,
        },
        message: isValid ? 'Certificate is valid' : 'Certificate is invalid or revoked',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download certificate as PDF
   * GET /api/v1/certificates/:certificateId/download
   */
  static async downloadCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;

      const pdfBuffer = await CertificateService.generatePDF(certificateId);

      if (!pdfBuffer) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: 'Certificate not found',
          code: 'CERTIFICATE_NOT_FOUND',
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate_${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke certificate (Admin only)
   * PATCH /api/v1/certificates/:certificateId/revoke
   * Body: { reason }
   */
  static async revokeCertificate(req, res, next) {
    try {
      const { certificateId } = req.params;
      const { reason } = req.body;

      if (req.user.role !== 'admin') {
        return res.status(statusCodes.FORBIDDEN).json({
          success: false,
          error: 'Only admins can revoke certificates',
          code: 'INSUFFICIENT_PERMISSION',
        });
      }

      const result = await CertificateService.revokeCertificate(certificateId, reason);

      if (!result.success) {
        return res.status(statusCodes.NOT_FOUND).json({
          success: false,
          error: result.error,
          code: 'CERTIFICATE_NOT_FOUND',
        });
      }

      res.status(statusCodes.OK).json({
        success: true,
        data: { certificate: result.certificate },
        message: 'Certificate revoked',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CertificateController;
