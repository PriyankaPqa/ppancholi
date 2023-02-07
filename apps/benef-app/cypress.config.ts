import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

require('tsconfig-paths').register();

const enableLogger = true; // https://github.com/archfz/cypress-terminal-report
export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.js',
  },
  e2e: {
    setupNodeEvents(on) {
      if (enableLogger) {
        installLogsPrinter(on, {
          printLogsToConsole: 'onFail',
          includeSuccessfulHookLogs: false,
        });
      }
    },
    baseUrl: 'http://localhost:8080/',
    projectId: 'FDDF6a',
    env: {
      AZURE_CLIENT_ID: '44dc9a29-39d1-462e-9cbe-b9507b34396d',
      AZURE_TENANT_ID: '56f61c9c-0a6f-4be2-954d-941c9f02cb4c',
      AZURE_CLIENT_SECRET: 'VwNQd7XbIYrV7stj58oiaKKHKphkjiw7KS',
      MSAL_API_SCOPES: 'https://crctechmain.onmicrosoft.com/emis-dev/api/api_access',
      API_BASE_URL: 'https://api-dev.crc-tech.ca',
      USER_6_MAIL: 'TestDev6@crctechtesting.onmicrosoft.com',
      USER_6_PASSWORD: 'I#cWVAo*EqA6',
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 8000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  pageLoadTimeout: 80000, // Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events.
});
