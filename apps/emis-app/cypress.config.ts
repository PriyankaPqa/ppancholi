import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

const { cloudPlugin } = require('cypress-cloud/plugin');

require('tsconfig-paths').register();

require('dotenv').config({ path: `${__dirname}/../../.env.local`, override: true });

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress-reporter-config.js',
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      installLogsPrinter(on, { // https://github.com/archfz/cypress-terminal-report
        printLogsToConsole: 'onFail', // 'never'
        includeSuccessfulHookLogs: false,
      });
      // eslint-disable-next-line global-require
      require('@cypress/grep/src/plugin')(config);
      return cloudPlugin(on, config);
    },
    videoUploadOnPasses: false,
    baseUrl: 'http://localhost:8080/',
    env: {
      /* Azure AD Config
       * Can eventually by removed when FeatureKeys.UseIdentityServer is in place
       */
      AZURE_CLIENT_ID: process.env.CYPRESS_AZURE_CLIENT_ID,
      AZURE_TENANT_ID: process.env.CYPRESS_AZURE_TENANT_ID,
      AZURE_CLIENT_SECRET: process.env.CYPRESS_AZURE_CLIENT_SECRET,
      MSAL_API_SCOPES: process.env.CYPRESS_MSAL_API_SCOPES,
      // End Azure AD Config

      // FeatureKeys.UseIdentityServer
      USE_IDS: process.env.CYPRESS_USE_IDS,
      IDS_TOKEN_ENDPOINT: process.env.CYPRESS_IDS_TOKEN_ENDPOINT,
      IDS_API_SCOPES: process.env.CYPRESS_IDS_API_SCOPES,
      API_PORTS: process.env.CYPRESS_API_PORTS,
      IDS_CLIENT_SECRET: process.env.CYPRESS_IDS_CLIENT_SECRET,
      // End FeatureKeys.UseIdentityServer

      API_BASE_URL: process.env.CYPRESS_API_BASE_URL,
      USER_0_MAIL: process.env.CYPRESS_USER_0_MAIL,
      USER_0_PASSWORD: process.env.CYPRESS_USER_0_PASSWORD,
      USER_1_MAIL: process.env.CYPRESS_USER_1_MAIL,
      USER_1_PASSWORD: process.env.CYPRESS_USER_1_PASSWORD,
      USER_2_MAIL: process.env.CYPRESS_USER_2_MAIL,
      USER_2_PASSWORD: process.env.CYPRESS_USER_2_PASSWORD,
      USER_3_MAIL: process.env.CYPRESS_USER_3_MAIL,
      USER_3_PASSWORD: process.env.CYPRESS_USER_3_PASSWORD,
      USER_4_MAIL: process.env.CYPRESS_USER_4_MAIL,
      USER_4_PASSWORD: process.env.CYPRESS_USER_4_PASSWORD,
      USER_5_MAIL: process.env.CYPRESS_USER_5_MAIL,
      USER_5_PASSWORD: process.env.CYPRESS_USER_5_PASSWORD,
      USER_6_MAIL: process.env.CYPRESS_USER_6_MAIL,
      USER_6_PASSWORD: process.env.CYPRESS_USER_6_PASSWORD,
      USER_NO_ROLE_MAIL: process.env.CYPRESS_USER_NO_ROLE_MAIL,
      USER_NO_ROLE_PASSWORD: process.env.CYPRESS_USER_NO_ROLE_PASSWORD,
      CONTRIBUTOR1_EMAIL: process.env.CYPRESS_CONTRIBUTOR1_EMAIL,
      CONTRIBUTOR1_PASSWORD: process.env.CYPRESS_CONTRIBUTOR1_PASSWORD,
      CONTRIBUTOR2_EMAIL: process.env.CYPRESS_CONTRIBUTOR2_EMAIL,
      CONTRIBUTOR2_PASSWORD: process.env.CYPRESS_CONTRIBUTOR2_PASSWORD,
      CONTRIBUTOR3_EMAIL: process.env.CYPRESS_CONTRIBUTOR3_EMAIL,
      CONTRIBUTOR3_PASSWORD: process.env.CYPRESS_CONTRIBUTOR3_PASSWORD,
      USER_READ_ONLY: process.env.CYPRESS_USER_READ_ONLY,
      USER_READ_ONLY_PASSWORD: process.env.CYPRESS_USER_READ_ONLY_PASSWORD,

      // Needs further discussion with security
      AZURE_CLIENT_ID_PROD: process.env.CYPRESS_AZURE_CLIENT_ID_PROD,
      AZURE_TENANT_ID_PROD: process.env.CYPRESS_AZURE_TENANT_ID_PROD,
      AZURE_CLIENT_SECRET_PROD: process.env.CYPRESS_AZURE_CLIENT_SECRET_PROD,
      MSAL_API_SCOPES_PROD: process.env.CYPRESS_MSAL_API_SCOPES_PROD,
      USER_PROD: process.env.CYPRESS_USER_PROD,
      USER_PROD_PASSWORD: process.env.CYPRESS_USER_PROD_PASSWORD,

      CUSTOM_ENV: '',
      CAN_MODE: process.env.CYPRESS_CAN_MODE,
      CANNOT_MODE: process.env.CYPRESS_CANNOT_MODE,

      commandDelay: process.env.CYPRESS_SLOW_DOWN_DELAY || 0, // cross-env CYPRESS_SLOW_DOWN_DELAY=1000 yarn cy:open
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 35000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  pageLoadTimeout: 80000, // Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events.
});
