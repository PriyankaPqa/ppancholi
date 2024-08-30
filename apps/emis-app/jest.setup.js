import 'regenerator-runtime/runtime';

jest.mock('@/auth/AuthenticationProvider');

beforeAll(() => {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;

  // Spy on console.error
  jest.spyOn(console, 'error').mockImplementation((...error) => {
    if (typeof error[0] === 'object' && error[0].type === 'XMLHttpRequest') {
      throw new Error(`
        The test failed due to an XMLHttpRequest error, likely because something is not correctly mocked.
        To debug, uncomment the console.log in the requestHandler function within service/lib/httpClient.ts.
        This will reveal which URL was called.
      `);
    }

    if (error.length === 1 && typeof error[0] === 'string' && error[0].startsWith('[Vue warn]: Invalid prop: type check failed')
      // kinda specific to $t mocked
      && error[0].indexOf('Expected String, got Object') > -1) {
      return;
    }

    // Call the original console.error with its arguments
    originalConsoleError(error);
  });
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error.mockRestore();
});
