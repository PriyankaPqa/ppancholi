module.exports = {
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
  workerIdleMemoryLimit: '1.5GB',
  clearMocks: true,
  coverageReporters: ['cobertura'],
  transform: {
    'vee-validate/dist/rules': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|jpg|jpeg|png|svg|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|avif)$': 'jest-transform-stub',
    '.*\\.(vue)$': '@vue/vue2-jest',
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
    ],
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: [
    '**/*.(spec|test).(js|jsx|ts|tsx)',
  ],
  testEnvironment: 'jsdom',
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
