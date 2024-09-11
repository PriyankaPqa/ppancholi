const baseConfig = require('./jest.config.base');
const coverageConfig = require('./jest.config.coverage');

module.exports = {
  ...baseConfig,
  ...coverageConfig,
  projects: [
    '<rootDir>/apps/emis-app',
    '<rootDir>/apps/benef-app',
    '<rootDir>/libs/registration-lib',
    '<rootDir>/libs/component-lib',
    '<rootDir>/libs/shared-lib',
    '<rootDir>/libs/entities-lib',
    '<rootDir>/libs/services-lib',
    '<rootDir>/libs/stores-lib',
  ],
  coverageDirectory: '<rootDir>/coverage/',
};
