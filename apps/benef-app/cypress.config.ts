import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

require('tsconfig-paths').register();
const { cloudPlugin } = require('cypress-cloud/plugin');
require('dotenv').config({ path: `${__dirname}/../../.env.local`, override: true });

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.js',
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      installLogsPrinter(on, {
        printLogsToConsole: 'onFail',
        includeSuccessfulHookLogs: false,
      });
      return cloudPlugin(on, config);
    },
    videoUploadOnPasses: false,
    baseUrl: 'http://localhost:8080/',
    env: {
      AZURE_CLIENT_ID: process.env.CYPRESS_AZURE_CLIENT_ID,
      AZURE_TENANT_ID: process.env.CYPRESS_AZURE_TENANT_ID,
      AZURE_CLIENT_SECRET: process.env.CYPRESS_AZURE_CLIENT_SECRET,
      MSAL_API_SCOPES: process.env.CYPRESS_MSAL_API_SCOPES,
      API_BASE_URL: process.env.CYPRESS_API_BASE_URL,
      USER_6_MAIL: process.env.CYPRESS_USER_6_MAIL,
      USER_6_PASSWORD: process.env.CYPRESS_USER_6_PASSWORD,
      CUSTOM_ENV: '',
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 8000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  pageLoadTimeout: 80000, // Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events.
});
