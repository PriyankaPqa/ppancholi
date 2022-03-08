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
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/*.(spec|test).(js|jsx|ts|tsx)',
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
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue',
  ],
  testURL: 'http://localhost/',
  snapshotSerializers: [
    'jest-serializer-vue',
  ],
};
