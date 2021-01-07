// const Vue = require('vue');
// const Vuetify = require('vuetify');
//
// Vue.use(Vuetify);

module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/store/**/*.{js,vue}',
    'src/ui/**/*.{js,vue}',
    '!src/registerServiceWorker.js',
    '!src/ui/helpers.ts',
    '!src/ui/template/**',
    '!src/ui/constants/**',
    '!src/ui/mixins/**',
    '!src/ui/plugins/**',
    '!src/ui/router/**',
    '!src/ui/test/**',
    '!src/main.ts', // No need to cover bootstrap file
  ],
  transform: {
    'vee-validate/dist/rules': 'babel-jest',
  },
  transformIgnorePatterns: [
    '<roodDir>/node_modules/(?!vee-validate/dist/rules)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/*.(spec|test).(js|jsx|ts|tsx)',
  ],
  roots: [
    '<rootDir>/src',
  ],

  testEnvironmentOptions: {
    // Allow test environment to fire onload event
    // See https://github.com/jsdom/jsdom/issues/1816#issuecomment-355188615
    resources: 'usable',
  },
  reporters: [
    'default',
    [
      'jest-trx-results-processor',
      {
        outputFile: './coverage/test-results.trx',
        defaultUserName: 'user name to use if automatic detection fails',
      },
    ],
  ],
};
