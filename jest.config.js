const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/apps/emis-app',
    '<rootDir>/apps/benef-app',
    '<rootDir>/libs/registration-lib',
    '<rootDir>/libs/component-lib',
    '<rootDir>/libs/core-lib',
    '<rootDir>/libs/entities-lib',
  ],
  coverageDirectory: '<rootDir>/coverage/',
};
