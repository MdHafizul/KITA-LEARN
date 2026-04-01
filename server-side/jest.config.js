module.exports = {
  testEnvironment: 'node',
  verbose: true,
  bail: false,
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js',
    '!src/app.js',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
  
  // Test timeout (10 seconds)
  testTimeout: 10000,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  
  // Transform files (if using any)
  transform: {
    '^.+\\.js$': ['babel-jest', { rootMode: 'upward' }],
  },
  
  // Test patterns
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
  ],
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
  
  // Maximum workers
  maxWorkers: '50%',
};
