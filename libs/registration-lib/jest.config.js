const baseConfig = require('../../jest.config.base');
const coverageConfig = require('../../jest.config.coverage');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/registration-lib/(.*)$': '<rootDir>/src/$1',
    '^@libs/component-lib/src/(.*)$': '<rootDir>/../../libs/component-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/component-lib/(.*)$': '<rootDir>/../../libs/component-lib/src/$1',
    '^@libs/shared-lib/src/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/shared-lib/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1',
    '^@libs/entities-lib/src/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/entities-lib/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1',
    '^@libs/services-lib/src/(.*)$': '<rootDir>/../../libs/services-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/services-lib/(.*)$': '<rootDir>/../../libs/services-lib/src/$1',
    '^@libs/stores-lib/src/(.*)$': '<rootDir>/../../libs/stores-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/stores-lib/(.*)$': '<rootDir>/../../libs/stores-lib/src/$1',
  },
  collectCoverageFrom: [
    ...coverageConfig.collectCoverageFrom,
    '**/components/**/*.{js,vue}',
    '**/ui/helpers/**/*.ts',
    '**/ui/mixins/**/*.{ts,js}',
  ],
  displayName: packageJson.name,
};
