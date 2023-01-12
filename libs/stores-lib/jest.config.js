const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  roots: [
    '<rootDir>/src',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^@libs/stores-lib/(.*)$': '<rootDir>/src/$1',
    '^@libs/shared-lib/src/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/shared-lib/(.*)$': '<rootDir>/../../libs/shared-lib/src/$1',
    '^@libs/services-lib/src/(.*)$': '<rootDir>/../../libs/services-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/services-lib/(.*)$': '<rootDir>/../../libs/services-lib/src/$1',
    '^@libs/entities-lib/src/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/entities-lib/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1',
    uuid: require.resolve('uuid'), // https://github.com/uuidjs/uuid/issues/451
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  displayName: packageJson.name,

};
