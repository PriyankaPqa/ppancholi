const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  projects: [
    '<rootDir>/apps/emis-app',
    '<rootDir>/apps/benef-app',
    '<rootDir>/libs/registration-lib',
    '<rootDir>/libs/component-lib',
    '<rootDir>/libs/shared-lib',
    '<rootDir>/libs/entities-lib',
    '<rootDir>/libs/services-lib',
  ],
  coverageDirectory: '<rootDir>/coverage/',
};
