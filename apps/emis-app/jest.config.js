const baseConfig = require('../../jest.config.base');
const packageJson = require('./package.json');

module.exports = {
  ...baseConfig,
  roots: [
    '<rootDir>/src',
  ],
  transformIgnorePatterns: [
    '<roodDir>/node_modules/(?!vee-validate/dist/rules)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@libs/registration-lib/src/(.*)$': '<rootDir>/../../libs/registration-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/registration-lib/(.*)$': '<rootDir>/../../libs/registration-lib/src/$1',
    '^@libs/component-lib/src/(.*)$': '<rootDir>/../../libs/component-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/component-lib/(.*)$': '<rootDir>/../../libs/component-lib/src/$1',
    '^@libs/core-lib/src/(.*)$': '<rootDir>/../../libs/core-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/core-lib/(.*)$': '<rootDir>/../../libs/core-lib/src/$1',
    '^@libs/entities-lib/src/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1', // in javascript file there is path like there is for TS so we need that
    '^@libs/entities-lib/(.*)$': '<rootDir>/../../libs/entities-lib/src/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  displayName: packageJson.name,
};
