const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/registration-lib/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '**/components/**/*.{js,vue}',
    '**/ui/helpers/**/*.ts',
    '**/ui/mixins/**/*.{ts,js}',
  ],
  name: packageJson.name,
  displayName: packageJson.name,
};
