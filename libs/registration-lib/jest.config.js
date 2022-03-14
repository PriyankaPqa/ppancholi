const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/registration-lib/(.*)$': '<rootDir>/src/$1',
    '^@libs/component-lib/src/(.*)$': '<rootDir>/../../libs/component-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/component-lib/(.*)$': '<rootDir>/../../libs/component-lib/src/$1',
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
