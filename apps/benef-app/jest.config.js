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
  },
  name: packageJson.name,
  displayName: packageJson.name,
};
