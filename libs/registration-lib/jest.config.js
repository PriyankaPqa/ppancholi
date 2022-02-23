const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@libs/registration-lib/(.*)$': '<rootDir>/src/$1',
  },
  name: packageJson.name,
  displayName: packageJson.name,
};
