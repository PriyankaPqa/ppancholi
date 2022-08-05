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
    '^@libs/core-lib/src/(.*)$': '<rootDir>/../../libs/core-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/core-lib/(.*)$': '<rootDir>/../../libs/core-lib/src/$1',
  },
  displayName: packageJson.name,
};
