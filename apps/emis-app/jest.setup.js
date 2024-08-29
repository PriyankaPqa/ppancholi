import 'regenerator-runtime/runtime';

jest.mock('@/auth/AuthenticationProvider');

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});

// eslint-disable-next-line import/no-extraneous-dependencies
const whyIsNodeRunning = require('why-is-node-running');

afterAll(() => {
  // Give Jest some time to close everything before running the check
  setTimeout(() => {
    whyIsNodeRunning(); // This will log what's keeping Node.js running
  }, 1000);
});
