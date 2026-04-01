/**
 * Redis Configuration
 * Connection setup for caching and job queue
 */

const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;

/**
 * Get or create Redis client
 * @returns {Redis} Redis client instance
 */
const getRedisClient = () => {
  if (!redisClient) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        enableReadyCheck: false,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      redisClient.on('error', (error) => {
        console.error('Redis Client Error:', error);
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected');
      });

      redisClient.on('disconnect', () => {
        console.log('⏸️  Redis disconnected');
      });
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }
  return redisClient;
};

/**
 * Check Redis connection
 * @returns {Promise<{success: boolean, message: string}>}
 */
const checkRedisConnection = async () => {
  try {
    const client = getRedisClient();
    await client.ping();
    return { 
      success: true, 
      message: 'Redis connected successfully' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Redis connection failed: ${error.message}` 
    };
  }
};

/**
 * Disconnect Redis
 */
const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

module.exports = {
  getRedisClient,
  checkRedisConnection,
  disconnectRedis
};
