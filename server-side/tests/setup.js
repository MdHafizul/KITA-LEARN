/**
 * Test Setup & Configuration
 * Runs before all tests
 */

const { PrismaClient } = require('@prisma/client');

// Test database configuration
global.testDB = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// Mock Redis for testing
jest.mock('ioredis', () => {
    return class RedisMock {
        constructor() {
            this.store = {};
        }

        async get(key) {
            return this.store[key] || null;
        }

        async set(key, value, mode, ttl) {
            this.store[key] = value;
            return 'OK';
        }

        async del(...keys) {
            keys.forEach(key => delete this.store[key]);
            return keys.length;
        }

        async exists(...keys) {
            return keys.filter(key => this.store[key]).length;
        }

        async flushall() {
            this.store = {};
            return 'OK';
        }

        async hgetall(key) {
            return this.store[key] || {};
        }

        async hset(key, ...args) {
            if (!this.store[key]) this.store[key] = {};
            for (let i = 0; i < args.length; i += 2) {
                this.store[key][args[i]] = args[i + 1];
            }
            return args.length / 2;
        }

        async expire(key, seconds) {
            if (this.store[key]) {
                setTimeout(() => delete this.store[key], seconds * 1000);
                return 1;
            }
            return 0;
        }
    };
});

// Global test utilities
global.testUtils = {
    /**
     * Generate random email
     */
    randomEmail: () => `test-${Math.random().toString(36).substring(7)}@test.com`,

    /**
     * Generate random string
     */
    randomString: (length = 10) =>
        Math.random().toString(36).substring(2, 2 + length),

    /**
     * Create test user
     */
    async createTestUser(data = {}) {
        const defaultData = {
            email: global.testUtils.randomEmail(),
            password: 'hashedPassword123',
            full_name: 'Test User',
            phone_number: '+1-000-000-0000',
            role: 'student',
            is_active: true,
            ...data,
        };
        return global.testDB.user.create({ data: defaultData });
    },

    /**
     * Create test course
     */
    async createTestCourse(lecturerId, data = {}) {
        const defaultData = {
            title: `Test Course ${global.testUtils.randomString()}`,
            description: 'Test course description',
            lecturer_id: lecturerId,
            status: 'draft',
            max_students: 50,
            is_published: false,
            ...data,
        };
        return global.testDB.course.create({ data: defaultData });
    },

    /**
     * Create test exam
     */
    async createTestExam(courseId, data = {}) {
        const defaultData = {
            course_id: courseId,
            title: `Test Exam ${global.testUtils.randomString()}`,
            description: 'Test exam',
            passing_score: 60,
            max_attempts: 3,
            duration_minutes: 60,
            shuffle_questions: false,
            is_published: false,
            ...data,
        };
        return global.testDB.exam.create({ data: defaultData });
    },

    /**
     * Cleanup test data
     */
    async cleanup() {
        // This will be called after each test
        // Customize based on your needs
    },
};

// Suppress console logs in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Extend Jest matchers if needed
expect.extend({
    toBeValidJWT(token) {
        const pass = typeof token === 'string' && token.split('.').length === 3;
        return {
            pass,
            message: () =>
                `Expected token to be a valid JWT but got: ${token}`,
        };
    },
});

// Setup & Teardown
beforeAll(async () => {
    // Any global setup before all tests
});

afterAll(async () => {
    // Cleanup after all tests
    await global.testDB.$disconnect();
});

afterEach(async () => {
    // Cleanup after each test
    await global.testUtils.cleanup();
});
