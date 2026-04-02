/**
 * Database Configuration
 * Prisma client initialization with connection pooling
 */

const { PrismaClient } = require('@prisma/client');

// Create Prisma client singleton
let prisma = null;

/**
 * Get Prisma client instance
 * @returns {PrismaClient} Prisma client
 */
const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error']
    });
  }
  return prisma;
};

/**
 * Disconnect Prisma client
 */
const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

/**
 * Check database connection
 * @returns {Promise<{success: boolean, message: string}>}
 */
const checkDatabaseConnection = async () => {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return {
      success: true,
      message: 'Database connected successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Database connection failed: ${error.message}`
    };
  }
};

module.exports = {
  getPrismaClient,
  disconnectPrisma,
  checkDatabaseConnection
};
