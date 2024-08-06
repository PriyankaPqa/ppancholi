import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';
import zephyrPlugin from '@libs/cypress-lib/src/reporter/cypress-zephyr/plugin';
import { initPlugins } from 'cypress-plugin-init';
import fs from 'fs';
import reporterConfig from './cypress-reporter-config';

require('tsconfig-paths').register();
const { cloudPlugin } = require('cypress-cloud/plugin');
require('dotenv').config({ path: `${__dirname}/../../.env.local`, override: true });

const zephyrReporter = process.env.ZEPHYR_REPORTER !== 'false';

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: reporterConfig,
  retries: {
    runMode: 5,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
      on(
        'after:spec',
        (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
          if (results && results.video) {
            // Do we have failures for any retry attempts?
            const failures = results.tests.some((test) => test.attempts.some((attempt) => attempt.state === 'failed'));
            if (!failures) {
              // delete the video if the spec passed and no tests retried
              fs.unlinkSync(results.video);
            }
          }
        },
      );

      installLogsPrinter(on, {
        printLogsToConsole: 'onFail',
        includeSuccessfulHookLogs: false,
      });
      // eslint-disable-next-line global-require
      require('@cypress/grep/src/plugin')(config);
      if (zephyrReporter) {
        return initPlugins(on, [cloudPlugin, zephyrPlugin], config);
      }
        return initPlugins(on, [cloudPlugin], config);
    },
    videoUploadOnPasses: true, // but we remove video if spec passed and no tests retried. See after:spec above
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
      commandDelay: process.env.CYPRESS_SLOW_DOWN_DELAY || 0, // cross-env CYPRESS_SLOW_DOWN_DELAY=1000 yarn cy:open
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 120000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  pageLoadTimeout: 120000, // Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events.
});
