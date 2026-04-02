const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');

const prisma = new PrismaClient();

class CertificateService {
  /**
   * Generate certificate from enrollment
   */
  async generateCertificate(enrollmentId, userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
        student: true
      }
    });

    if (!enrollment) {
      throw new ValidationException('Enrollment not found');
    }

    if (enrollment.status !== 'completed') {
      throw new ValidationException('Student has not completed this course');
    }

    // Check if already has certificate
    const existing = await prisma.certificate.findFirst({
      where: {
        userId: enrollment.userId,
        courseId: enrollment.courseId
      }
    });

    if (existing && !existing.isRevoked) {
      return existing;
    }

    const certificate = await prisma.certificate.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        issuedDate: new Date(),
        certificateNumber: this.generateCertificateNumber(),
        verificationCode: this.generateToken()
      }
    });

    return certificate;
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: true,
        course: true
      }
    });

    if (!certificate) {
      throw new ValidationException('Certificate not found');
    }

    return certificate;
  }

  /**
   * Get user's certificates (paginated)
   */
  async getUserCertificates(userId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const certificates = await prisma.certificate.findMany({
      where: {
        userId,
        isRevoked: false
      },
      include: { course: true },
      skip,
      take: limit,
      orderBy: { issuedDate: 'desc' }
    });

    const total = await prisma.certificate.count({
      where: {
        userId,
        isRevoked: false
      }
    });

    return {
      certificates,
      page,
      limit,
      total
    };
  }

  /**
   * Get course certificates
   */
  async getCourseCertificates(courseId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const certificates = await prisma.certificate.findMany({
      where: {
        courseId,
        isRevoked: false
      },
      include: { student: true },
      skip,
      take: limit
    });

    const total = await prisma.certificate.count({
      where: {
        courseId,
        isRevoked: false
      }
    });

    return {
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get student certificates
   */
  async getStudentCertificates(studentId) {
    const certificates = await prisma.certificate.findMany({
      where: {
        userId: studentId,
        isRevoked: false
      },
      include: { course: true }
    });

    return certificates;
  }

  /**
   * Verify certificate authenticity by ID
   */
  async verifyCertificate(certificateId) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: true,
        course: true
      }
    });

    if (!certificate) {
      throw new ValidationException('Invalid certificate');
    }

    if (certificate.isRevoked) {
      return {
        isValid: false,
        status: 'revoked',
        message: 'This certificate has been revoked'
      };
    }

    return {
      isValid: true,
      studentName: certificate.student.fullName,
      courseTitle: certificate.course.title,
      issuedDate: certificate.issuedDate,
      certificateNumber: certificate.certificateNumber
    };
  }

  /**
   * Generate certificate PDF
   */
  async generatePDF(certificateId) {
    const certificate = await this.getCertificateById(certificateId);

    if (!certificate) {
      return null;
    }

    // For now, return a simple placeholder
    // In production, you'd use a library like PDFKit or html-pdf
    const pdfContent = Buffer.from(
      `Certificate of Completion\n\n` +
      `Student: ${certificate.student.fullName}\n` +
      `Course: ${certificate.course.title}\n` +
      `Date: ${certificate.issuedDate.toLocaleDateString()}\n` +
      `Certificate #: ${certificate.certificateNumber}`
    );

    return pdfContent;
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(certificateId, reason) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId }
    });

    if (!certificate) {
      throw new ValidationException('Certificate not found');
    }

    const revoked = await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        isRevoked: true,
        revokeReason: reason
      }
    });

    return revoked;
  }

  /**
   * Utility: Generate unique certificate number
   */
  generateCertificateNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  /**
   * Utility: Generate verification token
   */
  generateToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

module.exports = new CertificateService();
