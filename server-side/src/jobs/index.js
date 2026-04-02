/**
 * Jobs Module
 * Central export for all background job processors
 */

const { queues, getQueueStatus, shutdownQueues } = require('./queue');
const certificateJob = require('./generate-certificate.job');
const emailJob = require('./send-email.job');
const gradeJob = require('./grade-calculation.job');

/**
 * Register all job processors
 * Call this once during app startup
 * Set QUEUE_PROCESSING=false to disable processors during testing
 */
const registerJobProcessors = () => {
    const enableQueueProcessing = process.env.QUEUE_PROCESSING !== 'false';

    if (!enableQueueProcessing) {
        console.log('⏸️  Queue processors disabled (QUEUE_PROCESSING=false)');
        return;
    }

    // Certificate generation processor
    queues.certificateQueue.process(async (job) => {
        return await certificateJob.generateCertificate(
            job.data.enrollmentId,
            job.data.certificateId
        );
    });

    // Email sending processor
    queues.emailQueue.process(async (job) => {
        return await emailJob.sendEmail(
            job.data.to,
            job.data.subject,
            job.data.template,
            job.data.templateData
        );
    });

    // Grade calculation processor
    queues.gradeQueue.process(async (job) => {
        if (job.data.type === 'course') {
            return await gradeJob.calculateCourseGrades(job.data.courseId);
        } else if (job.data.type === 'auto-grade') {
            return await gradeJob.autoGradeExamAttempt(job.data.attemptId);
        }
    });
};

/**
 * Enqueue certificate generation job
 */
const enqueueCertificateGeneration = async (enrollmentId, certificateId) => {
    return await queues.certificateQueue.add(
        { enrollmentId, certificateId },
        { priority: 'high' }
    );
};

/**
 * Enqueue email notification
 */
const enqueueEmail = async (to, subject, template, templateData = {}) => {
    return await queues.emailQueue.add(
        { to, subject, template, templateData },
        { priority: 'normal' }
    );
};

/**
 * Enqueue bulk emails
 */
const enqueueBulkEmails = async (recipients, subject, template, templateData = {}) => {
    for (const recipient of recipients) {
        await enqueueEmail(recipient, subject, template, templateData);
    }
};

/**
 * Enqueue grade calculation
 */
const enqueueGradeCalculation = async (courseId) => {
    return await queues.gradeQueue.add(
        { type: 'course', courseId },
        { priority: 'high' }
    );
};

/**
 * Enqueue auto-grading for exam attempt
 */
const enqueueAutoGrading = async (attemptId) => {
    return await queues.gradeQueue.add(
        { type: 'auto-grade', attemptId },
        { priority: 'high' }
    );
};

module.exports = {
    // Queue management
    queues,
    registerJobProcessors,
    getQueueStatus,
    shutdownQueues,

    // Job enqueueing
    enqueueCertificateGeneration,
    enqueueEmail,
    enqueueBulkEmails,
    enqueueGradeCalculation,
    enqueueAutoGrading,

    // Job implementations
    certificateJob,
    emailJob,
    gradeJob
};
