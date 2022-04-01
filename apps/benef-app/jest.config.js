const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  roots: [
    '<rootDir>/src',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/registration-lib/(.*)$': '<rootDir>/../../libs/registration-lib/src/$1',
    '^@libs/component-lib/(.*)$': '<rootDir>/../../libs/component-lib/src/$1',
    '^@libs/core-lib/(.*)$': '<rootDir>/../../libs/core-lib/src/$1',
  },
  name: packageJson.name,
  displayName: packageJson.name,
};
