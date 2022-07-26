module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: false,
  collectCoverageFrom: [
    '**/entities/**/*.ts',
    '**/services/**/*.ts',
    '**/store/**/*.ts',
    '**/ui/components/**/*.{js,vue}',
    '**/ui/views/**/**.{js,vue}',
    '!src/main.ts',
    '!**/store.ts',
    '!**/*.mock.ts',
    '!**/*.types.ts',
    '!**/index.ts',
  ],
  coverageReporters: ['cobertura'],
  transform: {
    'vee-validate/dist/rules': 'babel-jest',
    '.*\\.(vue)$': '@vue/vue2-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/*.(spec|test).(js|jsx|ts|tsx)',
  ],
  testEnvironmentOptions: {
    // Allow test environment to fire onload event
    // See https://github.com/jsdom/jsdom/issues/1816#issuecomment-355188615
    resources: 'usable',
    url: 'http://localhost/',
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
    // ['jest-slow-test-reporter', {
    //   numTests: 8, // how many slow tests to print
    //   warnOnSlowerThan: 300, // will warn when a test exceeds this time in milliseconds
    //   color: true, // will make the warnOnSlowerThan warning messages print in red
    // }],
  ],
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue',
  ],
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
};
