const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  roots: [
    '<rootDir>/src',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/entities-lib/(.*)$': '<rootDir>/src/$1',
    '^@libs/shared-lib/src/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/shared-lib/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1',
  },
  displayName: packageJson.name,
};
