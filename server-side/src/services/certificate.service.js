const { PrismaClient } = require('@prisma/client');
const { ValidationException } = require('../exceptions');

const prisma = new PrismaClient();

class CertificateService {
  /**
   * Generate certificate for student
   */
  async generateCertificate(studentId, courseId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: studentId,
        course_id: parseInt(courseId),
        status: 'completed'
      },
      include: {
        course: true,
        student: true
      }
    });

    if (!enrollment) {
      throw new ValidationException('Student has not completed this course');
    }

    // Check if already has certificate
    const existing = await prisma.certificate.findFirst({
      where: {
        student_id: studentId,
        course_id: parseInt(courseId)
      }
    });

    if (existing) {
      return existing;
    }

    const certificate = await prisma.certificate.create({
      data: {
        student_id: studentId,
        course_id: parseInt(courseId),
        issued_date: new Date(),
        certificate_number: this.generateCertificateNumber(),
        verification_token: this.generateToken()
      }
    });

    return certificate;
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(certificateNumber, verificationToken) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        certificate_number: certificateNumber,
        verification_token: verificationToken
      },
      include: {
        student: true,
        course: true
      }
    });

    if (!certificate) {
      throw new ValidationException('Invalid certificate');
    }

    return {
      is_valid: true,
      student_name: certificate.student.full_name,
      course_title: certificate.course.title,
      issued_date: certificate.issued_date,
      certificate_number: certificate.certificate_number
    };
  }

  /**
   * Get student certificates
   */
  async getStudentCertificates(studentId) {
    const certificates = await prisma.certificate.findMany({
      where: { student_id: studentId },
      include: { course: true }
    });

    return certificates;
  }

  /**
   * Get course certificates
   */
  async getCourseCertificates(courseId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const certificates = await prisma.certificate.findMany({
      where: { course_id: parseInt(courseId) },
      include: { student: true },
      skip,
      take: limit
    });

    const total = await prisma.certificate.count({
      where: { course_id: parseInt(courseId) }
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
   * Revoke certificate
   */
  async revokeCertificate(certificateId, reason) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(certificateId) }
    });

    if (!certificate) {
      throw new ValidationException('Certificate not found');
    }

    const revoked = await prisma.certificate.update({
      where: { id: parseInt(certificateId) },
      data: {
        is_revoked: true,
        revocation_reason: reason,
        revoked_at: new Date()
      }
    });

    return revoked;
  }

  /**
   * Generate certificate PDF (placeholder for actual PDF generation)
   */
  async generateCertificatePDF(certificateId) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(certificateId) },
      include: {
        student: true,
        course: true
      }
    });

    if (!certificate) {
      throw new ValidationException('Certificate not found');
    }

    // In production, use a library like PDFKit to generate actual PDF
    // For now, return certificate data that would be used to generate PDF
    return {
      student_name: certificate.student.full_name,
      course_title: certificate.course.title,
      issued_date: certificate.issued_date.toDateString(),
      certificate_number: certificate.certificate_number,
      verification_url: `https://lms.example.com/verify/${certificate.certificate_number}/${certificate.verification_token}`
    };
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
