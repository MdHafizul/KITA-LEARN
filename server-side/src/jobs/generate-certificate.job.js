/**
 * Certificate Generation Job
 * Generates PDF certificates for completed courses
 */

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Generate certificate for student
 * @param {number} enrollmentId - Enrollment ID
 * @param {number} certificateId - Certificate ID
 * @returns {Promise<string>} - Path to generated PDF
 */
const generateCertificate = async (enrollmentId, certificateId) => {
  try {
    // Fetch enrollment and certificate data
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        studentUser: {
          select: { full_name: true }
        },
        course: {
          select: { name: true, code: true }
        }
      }
    });

    if (!enrollment) {
      throw new Error(`Enrollment ${enrollmentId} not found`);
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        course: {
          select: { name: true, code: true }
        }
      }
    });

    if (!certificate) {
      throw new Error(`Certificate ${certificateId} not found`);
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([800, 600]);

    const { width, height } = page.getSize();
    const fontSize = 24;
    const smallFontSize = 14;

    // Add decorative border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 3
    });

    // Title
    page.drawText('Certificate of Completion', {
      x: width / 2 - 150,
      y: height - 80,
      size: fontSize,
      color: rgb(0.2, 0.4, 0.8),
      maxWidth: 300
    });

    // Student name
    page.drawText(`This is to certify that`, {
      x: 80,
      y: height - 150,
      size: smallFontSize,
      color: rgb(0, 0, 0)
    });

    page.drawText(enrollment.studentUser.full_name, {
      x: 80,
      y: height - 200,
      size: fontSize,
      color: rgb(0, 0, 0),
      maxWidth: 600
    });

    // Course info
    page.drawText(`has successfully completed the course`, {
      x: 80,
      y: height - 250,
      size: smallFontSize,
      color: rgb(0, 0, 0)
    });

    page.drawText(`${enrollment.course.name} (${enrollment.course.code})`, {
      x: 80,
      y: height - 300,
      size: fontSize,
      color: rgb(0, 0, 0),
      maxWidth: 600
    });

    // Date and certificate number
    const dateStr = new Date(certificate.issued_date).toLocaleDateString();
    page.drawText(`Issued on: ${dateStr}`, {
      x: 80,
      y: height - 380,
      size: smallFontSize,
      color: rgb(0.5, 0.5, 0.5)
    });

    page.drawText(`Certificate No: ${certificate.certificate_number}`, {
      x: 80,
      y: height - 410,
      size: smallFontSize,
      color: rgb(0.5, 0.5, 0.5)
    });

    // Save PDF
    const certificatesDir = path.join(process.cwd(), 'storage', 'certificates');
    await fs.mkdir(certificatesDir, { recursive: true });

    const filename = `cert_${certificateId}_${Date.now()}.pdf`;
    const filepath = path.join(certificatesDir, filename);

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(filepath, pdfBytes);

    // Update certificate with file path
    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        file_path: `storage/certificates/${filename}`,
        generated_at: new Date()
      }
    });

    logger.info(`Certificate generated: ${filename}`);
    return filepath;

  } catch (error) {
    logger.error('Certificate generation failed:', error.message);
    throw error;
  }
};

module.exports = {
  generateCertificate
};
