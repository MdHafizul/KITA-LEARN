/**
 * Bull Queue Configuration
 * Manages background job processing with Redis
 */

const Queue = require('bull');
const redisConfig = require('../config/redis');
const logger = require('../utils/logger');

// Initialize all job queues
const queues = {
  certificateQueue: new Queue('certificate-generation', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true
    }
  }),
  
  emailQueue: new Queue('email-notification', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000
      },
      removeOnComplete: true
    }
  }),
  
  gradeQueue: new Queue('grade-calculation', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 1000
      },
      removeOnComplete: true
    }
  }),
  
  auditQueue: new Queue('audit-logging', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: true
    }
  })
};

// Global event handlers for all queues
Object.entries(queues).forEach(([name, queue]) => {
  queue.on('failed', (job, err) => {
    logger.error(`${name}/${job.id} failed:`, err.message);
  });

  queue.on('completed', (job) => {
    logger.info(`${name}/${job.id} completed successfully`);
  });

  queue.on('error', (err) => {
    logger.error(`${name} error:`, err.message);
  });

  queue.on('stalled', (job) => {
    logger.warn(`${name}/${job.id} stalled - will retry`);
  });
});

// Health check for queues
const getQueueStatus = async () => {
  const status = {};
  
  for (const [name, queue] of Object.entries(queues)) {
    const jobCounts = await queue.getJobCounts();
    status[name] = jobCounts;
  }
  
  return status;
};

// Clear all queues (useful for testing/maintenance)
const clearAllQueues = async () => {
  for (const queue of Object.values(queues)) {
    await queue.clean(0, 'completed');
    await queue.clean(0, 'failed');
  }
  logger.info('All queues cleared');
};

// Graceful shutdown
const shutdownQueues = async () => {
  logger.info('Shutting down job queues...');
  for (const queue of Object.values(queues)) {
    await queue.close();
  }
  logger.info('Job queues shut down gracefully');
};

module.exports = {
  queues,
  getQueueStatus,
  clearAllQueues,
  shutdownQueues
};
