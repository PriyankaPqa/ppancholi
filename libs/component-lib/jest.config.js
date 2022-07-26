const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/component-lib/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    '**/components/**/*.{js,vue}',
  ],
  displayName: packageJson.name,
};
