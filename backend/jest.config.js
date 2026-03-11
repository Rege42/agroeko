export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 30000,
};