import 'regenerator-runtime/runtime';

jest.mock('@/auth/AuthenticationProvider');

beforeAll(() => {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;

  // Spy on console.error
  jest.spyOn(console, 'error').mockImplementation((error) => {
    if (typeof error === 'object' && error.type === 'XMLHttpRequest') {
      throw new Error(`
        The test failed due to an XMLHttpRequest error, likely because something is not correctly mocked.
        To debug, uncomment the console.log in the requestHandler function within service/lib/httpClient.ts.
        This will reveal which URL was called.
      `);
    }
    // Call the original console.error with its arguments
    originalConsoleError(error);
  });
});
