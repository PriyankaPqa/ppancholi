import 'regenerator-runtime/runtime';

jest.mock('@/auth/AuthenticationProvider');

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  throw reason;
});
