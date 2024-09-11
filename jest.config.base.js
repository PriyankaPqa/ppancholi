module.exports = {
  workerIdleMemoryLimit: '1.5GB',
  clearMocks: true,

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
