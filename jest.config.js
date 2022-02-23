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
    'vee-validate/dist/rules': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
    '^.+\\.tsx?$': 'ts-jest',
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
