const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.routes.ts', '!src/app/app.config.ts'],
  coverageDirectory: 'coverage/skillmate',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
