const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  roots: [
    '<rootDir>/src',
  ],
  transformIgnorePatterns: [
    '<roodDir>/node_modules/(?!uuid)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/services-lib/(.*)$': '<rootDir>/src/$1',
    '^@libs/shared-lib/src/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/shared-lib/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1',
    '^@libs/entities-lib/src/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/entities-lib/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1',
  },
  displayName: packageJson.name,
};
