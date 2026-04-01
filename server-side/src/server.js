const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

/**
 * Start Express Server
 */
const server = app.listen(PORT, HOST, () => {
  logger.info(
    `🚀 Server running at http://${HOST}:${PORT}`,
    {
      PORT,
      HOST,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    }
  );

  // Log initial API info
  console.log(`\n📚 API Documentation:`);
  console.log(`   Health Check: GET http://${HOST}:${PORT}/health`);
  console.log(`   DB Status:    GET http://${HOST}:${PORT}/api/v1/health/db`);
  console.log(`   Queue Status: GET http://${HOST}:${PORT}/api/v1/health/queues`);
  console.log(`   API Docs:     GET http://${HOST}:${PORT}/api/v1/docs (coming soon)`);
  console.log(`\n`);
});

/**
 * Graceful Shutdown
 */
const shutdown = async () => {
  logger.info('🛑 Shutting down gracefully...');
  
  // Shutdown job queues first
  if (app.jobs) {
    await app.jobs.shutdownQueues();
  }
  
  server.close(() => {
    logger.info('✅ Server closed');
    process.exit(0);
  });

  // Forced shutdown after 10 seconds
  setTimeout(() => {
    logger.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Uncaught Exception Handler
 */
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Unhandled Rejection Handler
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection:', { reason, promise });
  process.exit(1);
});

module.exports = server;
