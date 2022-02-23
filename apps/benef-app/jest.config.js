module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  collectCoverage: false,
  collectCoverageFrom: [
    '**/entities/**/*.ts',
    '**/services/**/*.ts',
    '**/store/**/*.ts',
    '**/ui/components/**/*.{js,vue}',
    '**/ui/views/**/**.{js,vue}',
    '!src/main.ts', // No need to cover bootstrap file
    '!**/store.ts',
    '!**/*.mock.ts',
    '!**/*.types.ts',
    '!**/index.ts',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue',
  ],
  transform: {
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    // '/node_modules/(?!vee-validate/dist/rules)',
    // 'node_modules/(?!vee-validate/dist/rules|@crctech/registration-lib/*)',
    // '/node_modules/(?!(@crctech/registration-lib)/)',
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
