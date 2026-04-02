/**
 * Monitoring & Health Check Utility
 * Provides system health status, version info, and diagnostics
 */

const { prisma } = require('../config');
const { redis } = require('../config');

/**
 * Check database connectivity and health
 */
const checkDatabaseHealth = async () => {
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;

        return {
            status: 'healthy',
            database: 'postgresql',
            responseTime: `${duration}ms`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            database: 'postgresql',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Check Redis connectivity and health
 */
const checkRedisHealth = async () => {
    try {
        const start = Date.now();
        await redis.ping();
        const duration = Date.now() - start;

        const info = await redis.info();
        const memoryMatch = info.match(/used_memory_human:(.+?)\r\n/);
        const usedMemory = memoryMatch ? memoryMatch[1] : 'unknown';

        return {
            status: 'healthy',
            service: 'redis',
            responseTime: `${duration}ms`,
            memory: usedMemory,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            service: 'redis',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Check job queues health
 */
const checkQueuesHealth = async (queues = {}) => {
    try {
        const queueHealth = {};

        for (const [queueName, queue] of Object.entries(queues)) {
            if (queue) {
                const counts = await queue.getJobCounts();
                queueHealth[queueName] = {
                    waiting: counts.waiting || 0,
                    active: counts.active || 0,
                    completed: counts.completed || 0,
                    failed: counts.failed || 0,
                    delayed: counts.delayed || 0
                };
            }
        }

        return {
            status: Object.values(queueHealth).some(q => q.failed > 0) ? 'warning' : 'healthy',
            queues: queueHealth,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Get comprehensive system health
 */
const getSystemHealth = async (queues = {}) => {
    const [dbHealth, redisHealth, queueHealth] = await Promise.all([
        checkDatabaseHealth(),
        checkRedisHealth(),
        checkQueuesHealth(queues)
    ]);

    const overallStatus =
        [dbHealth, redisHealth, queueHealth].every(h => h.status === 'healthy')
            ? 'healthy'
            : [dbHealth, redisHealth, queueHealth].some(h => h.status === 'unhealthy')
                ? 'unhealthy'
                : 'warning';

    return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
            database: dbHealth,
            redis: redisHealth,
            queues: queueHealth
        }
    };
};

/**
 * Get application version and info
 */
const getAppInfo = () => {
    const packageJson = require('../../package.json');

    return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    };
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
    try {
        const stats = {};

        // Table row counts
        const tables = [
            'users',
            'courses',
            'enrollments',
            'exams',
            'questions',
            'attempts',
            'submissions',
            'grades',
            'certificates'
        ];

        for (const table of tables) {
            try {
                const result = await prisma.$queryRawUnsafe(
                    `SELECT COUNT(*) as count FROM "${table}"`
                );
                stats[table] = result[0]?.count || 0;
            } catch (err) {
                // Table might not exist
                stats[table] = 0;
            }
        }

        return {
            status: 'success',
            stats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Diagnostic report
 */
const getDiagnostics = async (queues = {}, metrics = null) => {
    const [health, appInfo, dbStats] = await Promise.all([
        getSystemHealth(queues),
        getAppInfo(),
        getDatabaseStats()
    ]);

    return {
        diagnostic_timestamp: new Date().toISOString(),
        app: appInfo,
        health,
        database: dbStats,
        metrics: metrics ? metrics.getReport() : null,
        alerts: metrics ? metrics.getAlerts() : []
    };
};

module.exports = {
    checkDatabaseHealth,
    checkRedisHealth,
    checkQueuesHealth,
    getSystemHealth,
    getAppInfo,
    getDatabaseStats,
    getDiagnostics
};
